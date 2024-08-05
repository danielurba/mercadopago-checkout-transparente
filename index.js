const app = require("express")()
const consign = require('consign')

consign()
    .then('./config/middlewares.js')
    .then('./config/logger.js')
    .then('./api')
    .then('./config/routes.js')
    .then('./utils')
    .into(app)

app.listen(3000, () => {
    console.log(`Node server listening at http://localhost:3000/`)
})