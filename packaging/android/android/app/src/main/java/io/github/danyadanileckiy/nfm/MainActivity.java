package io.github.danyadanileckiy.nfm;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    // Back: close modal -> previous screen -> main hub -> in-game "Exit the game?" dialog (UI.backKey, js/ui8.js).
    private static final String BACK_JS =
        "(function(){try{if(window.UI&&UI.backKey)return UI.backKey();}catch(e){}return 'x'})()";

    /** JS bridge: window.NFMNative.exit() / keepOn(bool). */
    public class NativeBridge {
        @JavascriptInterface public void exit() { runOnUiThread(() -> finishAndRemoveTask()); }
        @JavascriptInterface public void keepOn(boolean on) {
            runOnUiThread(() -> {
                if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            });
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Edge-to-edge, draw under the display cutout.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        WebView wv = bridge != null ? bridge.getWebView() : null;
        if (wv != null) wv.addJavascriptInterface(new NativeBridge(), "NFMNative");
        hideSystemBars();
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override public void handleOnBackPressed() {
                if (bridge == null || bridge.getWebView() == null) { finish(); return; }
                bridge.getWebView().evaluateJavascript(BACK_JS, v -> {
                    if (v != null && v.contains("h")) return;
                    // JS unavailable: save and leave.
                    bridge.getWebView().evaluateJavascript("try{window.UIX&&UIX.flush&&UIX.flush()}catch(e){}", null);
                    finish();
                });
            }
        });
    }

    /** Immersive sticky: hide status + navigation bars; a swipe shows them transiently. */
    private void hideSystemBars() {
        View decor = getWindow().getDecorView();
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), decor);
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        c.hide(WindowInsetsCompat.Type.systemBars());
    }

    @Override
    public void onResume() { super.onResume(); hideSystemBars(); }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    @Override
    public void onPause() {
        if (bridge != null && bridge.getWebView() != null)
            bridge.getWebView().evaluateJavascript("try{window.UIX&&UIX.flush&&UIX.flush()}catch(e){}", null);
        super.onPause();
    }
}
