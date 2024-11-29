const express = require('express')
const { v4: uuid } = require('uuid')
const fileMulter = require('../middleware/file')
const fs = require('fs')
const { title } = require('process')
const router =  express.Router()
const request = require('request')
const axios = require('axios')
const BookModel = require('../models/books_schema')
const UserModel = require('../models/user_schema')


async function test() {
    let newUser = new UserModel({
        username:"test1",
        password:"123"
    })

    try{
       await newUser.save()
    } catch (err){
       console.log(e)
    }
}
test();

router.get('/books', async (req, res) => {
    try{
        let books = await BookModel.find().select('-__v')
        
        res.render('../view/book/index',{
            title: "Books",
            books: books,
            user: req.user})
    } catch(e) {
        res.status(500).json(e)
    }
   
})

router.get('/books/:id', async (req, res) => {
    const {id} = req.params
    const countRes = await axios.get(`http://counter:3001/counter/${id}`);

    try{
        let book = await BookModel.findById(id).select('-__v')
        if (book){
            res.render("../view/book/view",{
                title:"Book View",
                book:book,
                cnt:countRes.data.cnt
            })
        }else{
            res.redirect('/404')
        }
        await axios.post(`http://counter:3001/counter/${id}/incr`);
    }catch(e){
        res.status(500).json(e)
    }
    

})


router.get('/create',(req,res) =>{
    res.render('../view/book/create',{
        title:"Create book",
        book:{},
    })
})

router.post('/create', async (req, res) => {
    const {title, desc,authors,favourite,fileCover,fileName} = req.body

    if (!title || !desc || !authors) {
        res.status(400).json({ error: "Missing required fields" })
    
        return
    
    }

    let newBook = new BookModel({
        title,
        desc,
        authors,
        favourite,
        fileCover,
        fileName,
    })

    try{
       await newBook.save()
       res.redirect(`/api/books/${newBook._id}`)
    } catch (err){
        res.status(500).json({ error: "Internal Server Error" })
    }
})



router.get('/books/update/:id', async(req,res)=>{
    let {id} = req.params
    try{
        let book = await BookModel.findById(id).select('-__v')

        res.render('../view/book/update',{
            title:"Book Update",
            book:book,
        })

    }catch(e){
        res.status(500).json(e)
    }
 })

router.post('/books/update/:id', async (req, res) => {       
    const {title, desc,authors,favourite,fileCover,fileName} = req.body
    const {id} = req.params

    try{
        await BookModel.findByIdAndUpdate(id,{title,desc,authors,favourite,fileCover,fileName})
        res.redirect(`/api/books/${id}`)
    }catch(e){
        res.status(500).json(e)
    }

})



router.post('/books/delete/:id', async(req, res) => {
    const {id} = req.params

    try{
        await BookModel.deleteOne({_id:id})
        res.redirect('/api/books')
    }catch(e){
        res.status(500).json(e)   
    }
})

router.post('/books/login',(_req,res) =>{
    res.status(201)
    res.json({ id: 1, mail: "test@mail.ru" })
})

router.post('/books/:id/upload',fileMulter.single('test-file'),(req,res)=>{
    let {books} = stor
    let {id} = req.params
    let {path} = req.file
    const idx = books.findIndex(el => el.id === id)
    if (idx!==-1){
        books[idx].fileBook = path
        res.json('ok')
    }else{res.json('incorrect id | undefinded error')}

})

router.get('/books/:id/download',(req,res)=>{
    let {books} = stor
    let {id} = req.params
    const idx = books.findIndex(el => el.id === id)
    if (idx!==-1){
        let fileExist = fs.existsSync(books[idx].fileBook)
        if (fileExist){
            res.download(books[idx].fileBook)
        }
        else{
            res.json('book not found')
        }
    }else{res.json('incorrect id | undefinded error')}
})


module.exports = router