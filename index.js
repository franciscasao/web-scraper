const _ = require('lodash');
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const PORT = 8080;
const app = express();

const BASE_URL = "https://animekisa.tv";

const getOtherAnimeInfo = async (slug) => {
  console.info(`[START] Getting other anime info for ${slug} list...`);
  try {
    const response = await axios.get(`${BASE_URL}${slug}`);
    const html = response.data;
    const $ = cheerio.load(html);

    let episodes = [];
    $('.infovan', html).each(function () { //<-- cannot be a function expression
      const episodeURL = $(this).attr('href');
      const number = $(this).find('.infoept2 > .centerv').text();

      episodes.push({
        number: parseInt(number),
        url: `${BASE_URL}/${episodeURL}`
      })

      episodes = _.sortBy(episodes, 'number');
    })

    let status = "";
    $('.infodes2 > .textc').each(function () {
      status = $(this).text();
    });

    console.info(`[END] Getting other anime info for ${slug} list...`);
    return { episodes, status };
  } catch (error) {
    console.error("[ERROR] getOtherAnimeInfo: ", error);
    throw error;
  }
}

const getAnimeList = async () => {
  console.info("[START] Getting anime list...")
  try {
    const response = await axios.get(`${BASE_URL}/anime`);
    const html = response.data;
    const $ = cheerio.load(html);

    let animes = [];
    $('.an', html).each(function () {
      const slug = $(this).attr('href');
      const name = $(this).find('.lis').text();
      animes.push({ name, slug });
    });

    for (let i = 0; i < 10; i++) {
      const anime = animes[i];
      const otherInfo = await getOtherAnimeInfo(anime.slug);
      animes[i] = { ...anime, ...otherInfo };
    }

    console.debug(_.slice(animes, 0, 10));
  } catch (error) {
    console.debug("[ERROR] getAnimeList: ", error);
    throw error;
  }

  console.info("[END] Getting anime list...")
}

app.listen(PORT, async () => {
  console.debug(`server running on ${PORT}`);

  try {
    getAnimeList()
    // getAnimeEpisodes("ousama-ranking");
  } catch (error) {
    console.error("[ERROR] listen: ", error);
  }
});