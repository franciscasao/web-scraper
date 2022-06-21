const fs = require('fs');

const { getChaptersList, outputChapterContent } = require('../extractor/read-light-novel');

const outputTableOfContents = (chapters) => {
  console.log(`Generating table of contents.`);
  let fileName = './app/output/toc.ncx';
  let content = '<?xml version="1.0" encoding="utf-8" ?>\n';
  content += '<ncx version="2005-1" xml:lang="en" xmlns="http://www.daisy.org/z3986/2005/ncx/">\n';
  content += '  <head>\n';
  content += '    <meta content="9781685791919" name="dtb:uid"/>\n';
  content += '    <meta content="1" name="dtb:depth"/>\n';
  content += '    <meta content="0" name="dtb:totalPageCount"/>\n';
  content += '    <meta content="0" name="dtb:maxPageNumber"/>\n';
  content += '  </head>\n';
  content += '  <docTitle>\n';
  content += '    <text>The S-Classes That I Raised (1-100)</text>\n';
  content += '  </docTitle>\n';
  content += '  <navMap>\n';
  content += '    <navPoint id="navPoint-1" playOrder="1">\n';
  content += '      <navLabel>\n';
  content += '        <text>Table of Contents</text>\n';
  content += '      </navLabel>\n';
  content += '      <content src="Text/TableOfContents.html#tableofcontents"/>\n';
  content += '    </navPoint>\n';
  content += '    <navPoint id="navPoint-2" playOrder="2">\n';
  content += '      <navLabel>\n';
  content += '        <text>Color Inserts</text>\n';
  content += '      </navLabel>\n';
  content += '      <content src="Text/section-0001.html#auto_bookmark_toc_top"/>\n';
  content += '    </navPoint>\n';
  chapters.forEach((chapter, index) => {
    index = index + 3;
    content += `    <navPoint id="navPoint-${index}" playOrder="${index}">\n`;
    content += '      <navLabel>\n';
    content += `        <text>${chapter.title}</text>\n`;
    content += '      </navLabel>\n';
    content += `      <content src="Text/${chapter.fileName}#auto_bookmark_toc_top"/>\n`;
    content += '    </navPoint>\n';
  })
  content += '  </navMap>\n';
  content += '</ncx>\n';
  fs.writeFileSync(fileName, content);

  fileName = './app/output/TableOfContents.html';
  content = '<?xml version="1.0" encoding="utf-8"?>\n';
  content += '<!DOCTYPE html>\n';
  content += '\n';
  content += '  <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" xmlns:epub="http://www.idpf.org/2007/ops">\n';
  content += '    <head>\n';
  content += '      <meta charset="utf-8" />\n';
  content += '      <link href="../Styles/styles.css" rel="stylesheet" type="text/css" />\n';
  content += '      <title>Table of Contents</title>\n';
  content += '      <meta content="urn:uuid:c16c8ca9-5229-4d4d-9c8c-c2534a8a907f" name="Adept.expected.resource" />\n';
  content += '    </head>\n';
  content += '    <body>\n';
  content += '      <h3 class="P_TOC_Heading"><a id="tableofcontents"></a>Table of Contents</h3>\n';
  content += '\n';
  content += '      <p class="P_TOC_Entry_1"><a href="section-0001.html">Color Inserts</a></p>\n';
  chapters.forEach((chapter) => {
    content += `      <p class="P_TOC_Entry_1"><a href="${chapter.fileName}">${chapter.title}</a></p>\n`;
  });
  content += '    </body>\n';
  content += '  </html>\n';

  fs.writeFileSync(fileName, content);
  console.log(`TOC writtern to ${fileName}`);
}

const outputNav = (chapters) => {
  console.log(`Generating table of nav.`);
  const fileName = './app/output/nav.xhtml';

  let content = '<?xml version="1.0" encoding="utf-8" ?>\n';
  content += '<!DOCTYPE html>\n';
  content += '\n';
  content += '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">\n';
  content += '<head>\n';
  content += '    <meta charset="utf-8"/>\n';
  content += '    <title></title>\n';
  content += '    <style type="text/css">\n';
  content += '    ol { list-style-type: none; }\n';
  content += '    </style>\n';
  content += '</head>\n';
  content += '<body epub:type="frontmatter">\n';
  content += '	<nav epub:type="toc" id="toc">\n';
  content += '      <h1>Table of Contents</h1>\n';
  content += '      <ol>\n';
  content += '        <li>\n';
  content += '          <a href="Text/TableOfContents.html#tableofcontents">Table of Contents</a>\n';
  content += '        </li>\n';
  content += '        <li>\n';
  content += '          <a href="Text/section-0001.html#auto_bookmark_toc_top">Color Inserts</a>\n';
  content += '        </li>\n';
  chapters.forEach((chapter) => {
    content += '        <li>\n';
    content += `          <a href="Text/${chapter.fileName}#auto_bookmark_toc_top">${chapter.title}</a>\n`;
    content += '        </li>\n';
  });
  content += '      </ol>\n';
  content += '    </nav>\n';
  content += '  <nav epub:type="landmarks" id="landmarks" hidden="">\n';
  content += '    <h1>Landmarks</h1>\n';
  content += '    <ol>\n';
  content += '    </ol>\n';
  content += '  </nav>\n';
  content += '</body>\n';
  content += '</html>\n';

  fs.writeFileSync(fileName, content);
  console.log(`TOC writtern to ${fileName}`);
}

exports.run = async () => {
  try {
    const chapters = await getChaptersList('the-s-classes-that-i-raised');
    for (let i = 0; i < chapters.length; i++) {
      outputChapterContent(chapters[i].url, `./app/output/${chapters[i].fileName}`, chapters[i].title);
    }
    outputTableOfContents(chapters);
    outputNav(chapters);
  } catch (error) {
    throw error;
  }
}