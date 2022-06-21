var cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = "https://www.readlightnovel.me/";

const getFileName = (number) => {
  let formattedNumber = '';
  number++;
  if (number < 1000) formattedNumber += '0';
  if (number < 100) formattedNumber += '0';
  if (number < 10) formattedNumber += '0';

  formattedNumber += number;
  return `section-${formattedNumber}.html`;
}

exports.getChaptersList = async (slug, limit) => {
  const itemURL = `${BASE_URL}${slug}`;
  console.log(`Parsing data from ${itemURL}`);

  try {
    const response = await cloudscraper.get(itemURL);
    const $ = cheerio.load(response);

    const chapterFilter = 'ul.chapter-chs li a';
    const chapterURLs = [];
    $(chapterFilter).each(function () {
      if (limit == undefined || chapterURLs.length < limit) {
        chapterURLs.push({
          title: `Chapter ${$(this).html().replace(/^\D+/g, '')}`,
          number: parseInt($(this).html().replace(/^\D+/g, '')),
          url: $(this).attr('href'),
          fileName: getFileName(parseInt($(this).html().replace(/^\D+/g, '')))
        });
      }
    })

    return chapterURLs;
  } catch (error) {
    console.error("[ERROR] getChaptersList: ", error);
    throw error;
  }
}

exports.outputChapterContent = async (chapterURL, fileName, chapterName) => {
  console.log(`Getting content from ${chapterURL}`);

  try {
    const response = await cloudscraper.get(chapterURL);
    const $ = cheerio.load(response);

    const contentParagraphs = 'div.desc > p';
    let content = '<?xml version="1.0" encoding="utf-8"?>\n'
    content += '<!DOCTYPE html>\n';
    content += '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" xmlns:epub="http://www.idpf.org/2007/ops">\n';
    content += '<head>\n';
    content += '<meta charset="utf-8"/>\n';
    content += '<link href="../Styles/styles.css" rel="stylesheet" type="text/css"/>\n';
    content += `<title>${chapterName}</title>\n`;
    content += '<meta content="urn:uuid:c16c8ca9-5229-4d4d-9c8c-c2534a8a907f" name="Adept.expected.resource"/>\n';
    content += '</head>\n';
    content += '<body>\n';
    content += `<p class="P__STAR__STAR__STAR__page_break" id="auto_bookmark_toc_top"><span><span style=" font-weight: bold; font-size: 1.17em;">${chapterName}</span></span></p>\n`;
    content += '<p class="P_Prose_Formatting">&#160;</p>\n';

    $(contentParagraphs).each(function () {
      if ($(this).text() !== "") {
        content += `<p class="P_Prose_Formatting"><span style=" font-size: 1.00em;">${$(this).text()}</span></p>\n`;
      }
    });

    const strongParagraphs = 'div.desc > strong > p';
    $(strongParagraphs).each(function () {
      if ($(this).text() !== "") {
        content += `<p class="P_Prose_Formatting"><span style=" font-size: 1.00em;">${$(this).text()}</span></p>\n`;
      }
    });

    content += '</body>\n';
    content += '</html>\n';

    fs.writeFileSync(fileName, content);
    console.log(`Content writtern to ${fileName}`);
  } catch (error) {
    console.error("[ERROR] outputChapterContent: ", error);
    throw error;
  }
}