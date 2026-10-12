package io.github.danyadanileckiy.nfm;

import android.os.Bundle;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private long lastBack = 0;
    // Back: close modal -> previous screen -> main hub -> double press to exit (game is saved first).
    private static final String BACK_JS =
        "(function(){try{var m=document.getElementById('modal');" +
        "if(m&&!m.classList.contains('hidden')){UI.closeM();return 'h'}" +
        "var s=UI.st;var lock=['match','post','fired','title','newgame'];" +
        "if(s&&lock.indexOf(s.cur)<0){if(s.stack&&s.stack.length){UI.back();return 'h'}if(s.cur!=='hub'){UI.home();return 'h'}}" +
        "if(window.UIX&&UIX.flush)UIX.flush();}catch(e){}return 'x'})()";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override public void handleOnBackPressed() {
                if (bridge == null || bridge.getWebView() == null) { finish(); return; }
                bridge.getWebView().evaluateJavascript(BACK_JS, v -> {
                    if (v != null && v.contains("h")) return;
                    long now = System.currentTimeMillis();
                    if (now - lastBack < 2000) { finish(); }
                    else { lastBack = now; Toast.makeText(MainActivity.this, "Нажмите «Назад» ещё раз для выхода", Toast.LENGTH_SHORT).show(); }
                });
            }
        });
    }

    @Override
    public void onPause() {
        if (bridge != null && bridge.getWebView() != null)
            bridge.getWebView().evaluateJavascript("try{window.UIX&&UIX.flush&&UIX.flush()}catch(e){}", null);
        super.onPause();
    }
}
