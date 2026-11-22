"""Export the current runtime OpenAPI contract and a reviewable grouped API index."""
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from app.config import Settings
from app.main import create_app


def export():
    specification=create_app(settings=Settings(),run_worker=False).openapi()
    target=ROOT/'docs/api'
    target.mkdir(parents=True,exist_ok=True)
    (target/'openapi.json').write_text(json.dumps(specification,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    groups={}
    for path,item in specification['paths'].items():
        for method,operation in item.items():
            if method not in ('get','post','put','patch','delete','options','head'):continue
            group=(operation.get('tags') or ['other'])[0]
            success=', '.join(code for code in operation.get('responses',{}) if code.startswith('2'))
            body=operation.get('requestBody',{}).get('content',{})
            schemas=[value.get('schema',{}) for value in body.values()]
            model=', '.join(schema.get('$ref','').rsplit('/',1)[-1] or schema.get('type','') for schema in schemas) or '—'
            parameters=', '.join(p['name']+(' *' if p.get('required') else '') for p in operation.get('parameters',[]) if p.get('in')=='query') or '—'
            groups.setdefault(group,[]).append((method.upper(),path,operation.get('summary',''),parameters,model,success))
    lines=['# API 接口目录','',f"从 `app.main.create_app().openapi()` 生成，共 {sum(map(len,groups.values()))} 个操作。",'',
        '完整请求、响应、字段约束和错误码见 [OpenAPI 快照](./api/openapi.json)；运行时 `/openapi.json` 为权威版本。',
        '重新生成：`python scripts/export-api-catalog.py`。查询参数后的 `*` 表示必填；路径参数均在 URL 中。','',
        '业务路径使用 `/api/v1/workspaces/{workspace_id}`；前台通过 Bearer token 调用，不使用跨域 Cookie。',
        '需幂等键、版本或费用确认的接口仍须遵循 OpenAPI 的说明，目录中的成功状态不代表可省略这些字段。','']
    for group,entries in sorted(groups.items()):
        lines += [f'## {group} ({len(entries)})','','| 方法 | 路径 | 用途 | 查询参数 | 请求模型 | 成功状态 |','| --- | --- | --- | --- | --- | --- |']
        for entry in entries:lines.append('| '+' | '.join(str(cell).replace('|','/').replace('\n',' ') for cell in entry)+' |')
        lines.append('')
    (ROOT/'docs/API接口目录.md').write_text('\n'.join(lines),encoding='utf-8')
    print(f'Exported {sum(map(len,groups.values()))} operations and {len(specification["components"]["schemas"])} schemas')


if __name__=='__main__':export()
