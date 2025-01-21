import json
import re

def get_value_from_nested_data(data, key):
    keys = key.split('.')
    for k in keys:
        if isinstance(data, dict) and k in data:
            data = data[k]
        else:
            return None
    return data

def render_loops(template, data):
    loop_pattern = re.compile(r"{% for (\w+) in (\w+) %}(.+?){% endfor %}", re.DOTALL)
    matches = loop_pattern.findall(template)
    for match in matches:
        loop_var, loop_data_key, loop_content = match
        loop_data = get_value_from_nested_data(data, loop_data_key)
        if isinstance(loop_data, list):
            rendered_content = ""
            loop_length = len(loop_data)
            for index, item in enumerate(loop_data):
                item_content = loop_content
                for key, value in item.items():
                    item_content = item_content.replace(f"{{{{ {loop_var}.{key} }}}}", str(value))
                # Simula {% if loop.index != loop.length %}
                if "{% if loop.index != loop.length %}" in item_content:
                    if index + 1 != loop_length:
                        item_content = item_content.replace("{% if loop.index != loop.length %}", "").replace("{% endif %}", "")
                    else:
                        item_content = re.sub(r"{% if loop\.index != loop\.length %}.*?{% endif %}", "", item_content, flags=re.DOTALL)
                rendered_content += item_content
            template = template.replace(f"{{% for {loop_var} in {loop_data_key} %}}{loop_content}{{% endfor %}}", rendered_content)
    return template

def replace_placeholders(template, data):
    placeholders = re.findall(r"{{(.*?)}}", template)
    for placeholder in placeholders:
        value = get_value_from_nested_data(data, placeholder)
        if value is None:
            value = f"{{{{{placeholder}}}}}"
        template = template.replace(f"{{{{{placeholder}}}}}", str(value))
    return template

with open('data.json', 'r') as json_file:
    data = json.load(json_file)

with open('template.html', 'r') as template_file:
    template = template_file.read()

template = render_loops(template, data)
html = replace_placeholders(template, data)

with open('templates/output.html', 'w') as output_file:
    output_file.write(html)

print("HTML generato con successo: output.html")
