import io, sys

path = 'public/js/templates.js'
src = io.open(path, encoding='utf-8').read()
new = io.open('.zscripts/_themes.txt', encoding='utf-8').read()

marker = '   *  Theme catalog'
i = src.index(marker)
start = src.rindex('  /* ---', 0, i)
end = src.index('\n  ];\n', start) + len('\n  ];\n')

io.open(path, 'w', encoding='utf-8').write(src[:start] + new + src[end:])
print('spliced', end - start, '->', len(new))
