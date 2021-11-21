// API REST dos livros
import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const nomeCollection = 'livros'
const { db, ObjectId } = await connectToDatabase()

/**********************************************
 * Validações
 * 
 **********************************************/
const validaLivro = [
  check('nome', 'Nome do Livro é obrigatório').not().isEmpty(),
  check('tipo', 'O tipo de ser Admin, Livro ou Professor').isIn(['Admin', 'Livro', 'Professor']),
  check('anoGraduação', 'O ano de graduação deve estar entre 2021 e 2050').isInt({ min: 2021, max: 2050 }),
  check('notaMédia', 'A nota média deve ser um número').isNumeric()
]


/**********************************************
 * GET /livros/
 * Lista todos os livros
 **********************************************/
router.get("/", async (req, res) => {
  try {
    db.collection(nomeCollection).find({}).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna os documentos
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
})

/**********************************************
 * GET /livros/:id
 * Lista o Livro através do id
 **********************************************/
router.get("/:id", async (req, res) => {
  try {
    db.collection(nomeCollection).find({ "_id": { $eq: ObjectId(req.params.id) } }).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna o documento
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
}) 

/**********************************************
 * GET /livros/nome/:nome
 * Lista o Livro através de parte do seu nome
 **********************************************/
router.get("/nome/:nome", async (req, res) => {
  try {
    db.collection(nomeCollection).find({ nome: {$regex: req.params.nome, $options: "i"} }).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna o documento
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
})

/**********************************************
 * POST /livros/
 * Inclui um novo Livro
 **********************************************/
router.post('/', validaLivro, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json(({
      errors: errors.array()
    }))
  } else {
    await db.collection(nomeCollection)
      .insertOne(req.body)
      .then(result => res.status(201).send(result)) //retorna o ID do documento inserido)
      .catch(err => res.status(400).json(err))
  }
})

/**********************************************
 * PUT /livros/
 * Alterar um Livro pelo ID
 **********************************************/
router.put('/', validaLivro, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json(({
      errors: errors.array()
    }))
  } else {
    const LivroInput = req.body
    await db.collection(nomeCollection)
      .updateOne({ "_id": { $eq: ObjectId(req.body._id) } }, {
        $set:
        {
          nome: LivroInput.nome,
          genêro: LivroInput.genêro,
          autor: LivroInput.autor,
          lançamento: LivroInput.lançamento,
          nPaginas: LivroInput.nPaginas
        }
      },
        { returnNewDocument: true })
      .then(result => res.status(202).send(result))
      .catch(err => res.status(400).json(err))
  }
})

/**********************************************
 * DELETE /livros/
 * Apaga um Livro pelo ID
 **********************************************/
router.delete('/:id', async (req, res) => {
  await db.collection(nomeCollection)
    .deleteOne({ "_id": { $eq: ObjectId(req.params.id) } })
    .then(result => res.status(202).send(result))
    .catch(err => res.status(400).json(err))
})

export default router