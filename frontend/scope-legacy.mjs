import fs from 'node:fs';
import postcss from 'postcss';

// Scope the old form stylesheet so its element selectors cannot override Ant Design.
const css = fs.readFileSync(new URL('../app/web_ui/app.css', import.meta.url), 'utf8');
const root = postcss.parse(css);
root.walkAtRules('charset', rule=>rule.remove());
root.walkRules(rule=>{
  if (rule.parent?.type==='atrule' && /keyframes$/.test(rule.parent.name)) return;
  rule.selectors=rule.selectors.map(selector=>{
    if (selector.trim()===':root' || selector.trim()==='body') return '.legacy';
    return `.legacy ${selector}`;
  });
});
fs.writeFileSync(new URL('./src/legacy.css', import.meta.url), root.toString());
