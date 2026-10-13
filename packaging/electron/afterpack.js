// electron-builder afterPack hook: wine cannot write the icon/version resources,
// so we patch the Windows exe with resedit (pure JS) instead.
const fs=require('fs'),path=require('path');
exports.default=async ctx=>{ if(ctx.electronPlatformName!=='win32') return;
 const RE=await import('resedit'); const PE=await import('pe-library');
 const ResEdit=RE.default||RE, PeLib=PE.default||PE;
 const exe=path.join(ctx.appOutDir,ctx.packager.appInfo.productFilename+'.exe'); const v=ctx.packager.appInfo.version;
 const e=PeLib.NtExecutable.from(fs.readFileSync(exe),{ignoreCert:true}); const r=PeLib.NtExecutableResource.from(e);
 const ico=ResEdit.Data.IconFile.from(fs.readFileSync(path.join(__dirname,'../icons/icon.ico')));
 ResEdit.Resource.IconGroupEntry.replaceIconsForResource(r.entries,1,1033,ico.icons.map(i=>i.data));
 const vi=ResEdit.Resource.VersionInfo.fromEntries(r.entries)[0]; const [a,b,c]=v.split('.').map(Number);
 vi.setFileVersion(a,b,c,0,1033); vi.setProductVersion(a,b,c,0,1033);
 vi.setStringValues({lang:1033,codepage:1200},{FileDescription:'Сборная: Футбольный Менеджер',ProductName:'Сборная Футбольный Менеджер',CompanyName:'DanyaDanileckiy',LegalCopyright:'Copyright © 2026 DanyaDanileckiy',InternalName:'Сборная Футбольный Менеджер',OriginalFilename:''});
 vi.outputToResourceEntries(r.entries); r.outputResource(e); fs.writeFileSync(exe,Buffer.from(e.generate())); console.log('  • resedit ok',exe); };
