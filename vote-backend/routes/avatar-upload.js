const { Router } = require('express')
const formidable = require('formidable')
const path = require('path')

const router = Router()

const options = {
  multiples: false,
  keepExtensions: true,
  maxFileSize: 2 * 1024 * 1024, /* (max: 1M) */
  uploadDir: path.join(__dirname, '../uploads'),
}

router.post('/', (req, res, next) => {
  const form = formidable(options)
  form.parse(req, async (err, _, files) => {
    if (err) {
      next(err)
      return 
    }
    res.status(200).json({
      url: '/uploads/' + path.basename(files.file.path)
    })
  })
})



module.exports =  router
