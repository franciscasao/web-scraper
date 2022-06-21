const express = require('express');
const ln2epub = require('./app/main/ln2epub');

const PORT = 8081;

const app = express();
app.listen(PORT, () => {
  console.debug(`server running on ${PORT}`);

  try {
    ln2epub.run();
  } catch (error) {
    console.error("[ERROR] listen: ", error);
  }
});