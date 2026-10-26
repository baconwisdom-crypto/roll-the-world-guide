export function stripComments(source) {
  let result='',quote=null;
  for(let i=0;i<source.length;i++) {
    const c=source[i],n=source[i+1];
    if(quote) { result+=c; if(c==='\\') result+=source[++i]??''; else if(c===quote) quote=null; }
    else if(c==='"'||c==="'"||c==='`') {quote=c;result+=c;}
    else if(c==='/'&&n==='/') {while(i<source.length&&source[i]!=='\n')i++;result+='\n';}
    else if(c==='/'&&n==='*') {i+=2;while(i<source.length&&!(source[i]==='*'&&source[i+1]==='/'))i++;i++;result+=' ';}
    else result+=c;
  }
  return result;
}
