const TOKEN_RE =
  /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|(^[ \t]*#[^\n]*)|("(?:[^"\\]|\\.)*")|\b(void|int|float|double|bool|const|static|unsigned|long|short|char|uint8_t|uint16_t|uint32_t|int16_t|int32_t|byte|if|else|for|while|do|return|break|continue|true|false|switch|case|default|struct|class)\b|\b(\d+\.?\d*)\b|\b([A-Za-z_]\w*)(?=\s*\()/g;

export function highlightCpp(code) {
  const out = [];
  let last = 0;
  let key = 0;
  let m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(code)) !== null) {
    if (m.index > last) out.push(<span key={key++}>{code.slice(last, m.index)}</span>);
    const cls = m[1] || m[2] ? "tok-cmt" : m[3] ? "tok-pre" : m[4] ? "tok-str" : m[5] ? "tok-kw" : m[6] ? "tok-num" : "tok-fn";
    out.push(
      <span key={key++} className={cls}>
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < code.length) out.push(<span key={key++}>{code.slice(last)}</span>);
  return out;
}
