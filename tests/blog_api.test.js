const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const api = supertest(app)

const Blog = require('../models/blogs')
const User = require('../models/users')

beforeEach(async () => {
  await Blog.deleteMany({})

  await Blog.insertMany(helper.initialBlogs)
})

describe("when fetching blogs", () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('check blog Schema have id attribute or not', async () => {
    const response = await api.get('/api/blogs')
  
    assert(response.body[0].id)
  })

  test('a specific blog is returned', async () => {
    const response = await api.get('/api/blogs')

    const title = response.body.map(r => r.title)
    assert(title.includes('Random Blog'))
  })

  test('all notes are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })
})

describe("when creating blogs", () => {
  test('A valid blog can be added', async () => {
    const newBlog = {
      title: "How to Cook",
      author: "Bob",
      url: "www.howtocook.com",
      likes: 5
    }

    await Blog.deleteMany({})

    const user = await api
    .post('/api/users')
    .send({ username: 'Alex', password: '12345' })
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const token = await api
      .post('/api/login/')
      .send({ username: user.body.username, password: '12345' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    await api
      .post('/api/blogs/')
      .send(newBlog)
      .set({ 'Authorization': `bearer ${token.body.token}`, Accept: 'application/json'})
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogAtEnd.length, 1)
  
    const title = blogAtEnd.map(b => b.title)
    assert(title.includes('How to Cook'))
  })
  
  test("Likes default to 0", async() => {
    const newBlog = {
      title: "How to Eat",
      author: "Aleksei Yin",
      url: "https://www.howtocook.com"
    }
  
    await Blog.deleteMany({})

    const user = await api
    .post('/api/users')
    .send({ username: 'Aleksei', password: '12345' })
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const token = await api
    .post('/api/login/')
    .send({ username: user.body.username, password: '12345' })
    .expect(200)
    .expect('Content-Type', /application\/json/)
    
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set({ 'Authorization': `bearer ${token.body.token}`, Accept: 'application/json'})
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    const likes = blogsAtEnd.map((blog) => blog.likes)
    assert.deepEqual(likes[0], 0)
  })

  test('if title is missing appropiate status is returned', async () => {
    const blogWithoutTitle = {
      author: "random",
      url: "https://www.howtocook.com",
      likes: 5
    }
    const user = await api
      .post('/api/users')
      .send({ username: 'Joe', password: '123' })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const token = await api
      .post('/api/login/')
      .send({ username: user.body.username, password: '123' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    await api
      .post('/api/blogs')
      .send(blogWithoutTitle)
      .set({ 'Authorization': `bearer ${token.body.token}`, Accept: 'application/json' })
      .expect(400)
      .expect('Content-Type', /application\/json/);

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  });
  test('if url is missing appropiate status is returned', async () => {
    const blogWithoutUrl = {
      title: "How to Eat",
      author: "Bob",
      likes: 5
    }

    const user = await api
      .post('/api/users')
      .send({ username: 'Rob', password: '2222' })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const token = await api
      .post('/api/login/')
      .send({ username: user.body.username, password: '2222' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    await api
      .post('/api/blogs')
      .send(blogWithoutUrl)
      .set({ 'Authorization': `bearer ${token.body.token}`, Accept: 'application/json' })
      .expect(400)
      .expect('Content-Type', /application\/json/);

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe("When deleting blogs", () => {
  test("succeeds if user created blog", async () => {
    let blogAtStart = await helper.blogsInDb()

    const user = await api
    .post('/api/users')
    .send({ username: 'Deleter', password: '1234' })
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const token = await api
    .post('/api/login/')
    .send({ username: user.body.username, password: '1234' })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const createdBlog = await api
    .post('/api/blogs')
    .send({ title: 'to delete', author: 'to delete', url: 'www.delete.com', likes: 1 })
    .set({ 'Authorization': `bearer ${token.body.token}`, Accept: 'application/json' })
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogToDelete = createdBlog.body

  const blogsAfterCreating = await helper.blogsInDb()
  assert.strictEqual(blogsAfterCreating.length, blogAtStart.length + 1)

  const titlesAfterCreating = blogsAfterCreating.map(blog => blog.title)
  assert(titlesAfterCreating.includes(blogToDelete.title))


  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set({ 'Authorization': `bearer ${token.body.token}`, Accept: 'application/json' })
    .expect(204)

    let blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

    let title = blogsAtEnd.map(r => r.title)
    assert(!title.includes(blogToDelete.title))
  })

  test("a blog will not be deleted if the user did not create the blog", async () => {
    const blogsAtStart = await helper.blogsInDb()
    let blogToDelete = blogsAtStart[0]

    const user = await api
      .post('/api/users')
      .send({username: 'Hamburger', password: '12345'})
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const token = await api
      .post('/api/login')
      .send({username: user.body.username, password: '12345'})
      .expect(200)
      .expect('Content-Type', /application\/json/)

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)
      .set({'Authorization': `bearer ${token.body.token}`, Accept: 'application/json'})

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)

    const titles = blogsAtEnd.map(blog => blog.title)
    assert(titles.includes(blogToDelete.title))
  })
})

describe('When updating blogs', () => {
  test("updating likes returns a status of 204", async () => {
    let blogsAtStart = await helper.blogsInDb()
    let blogToUpdate = blogsAtStart[0]
    let update = { title: 'Changed Title', author: "Different Author", url: 'www.newurl.com', likes: blogToUpdate.likes + 1}

    let updatedBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(update)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(updatedBlog.body, { title: 'Changed Title', author: "Different Author", url: 'www.newurl.com', likes: blogToUpdate.likes + 1, user: [], id: blogToUpdate.id})
    assert.notDeepEqual(updatedBlog.body, blogToUpdate)

  })
})

describe('Users', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'aleksei',
      name: 'Aleksei Yin',
      password: 'ayin24',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})