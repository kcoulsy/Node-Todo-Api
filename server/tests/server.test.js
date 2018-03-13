const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {users, todos, populateTodos, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () =>{
  it('should create a new todo', (done) =>{
    var text = 'Todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res)=>{
        if(err){
          return done(err);
        }

      Todo.find({text}).then((todos) => {
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text);
        done();
      }).catch((e) =>{
        done(e);
      });

    })
  });

  it('should not create todo with invalid body data', (done)=>{
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));

    });

  });
});


describe('GET /todos',()=>{
  it('should get all todos', (done)=> {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res)=>{
        // console.log(res.body);
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return the todo back in response body', (done) => {
    // console.log(`/todos/${todos[0]._id.toHexString()}`);
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .expect(200)
    .expect((res) => {
      // console.log(res.body);
      expect(res.body.todo.text).toBe(todos[0].text)
    })
    .end(done);
  });


  it('should return 404 if not a valid id',(done) =>{
    var id = new ObjectID
    request(app)
      .get(`/todos/${id.toHexString() + "1111"}`)
      .expect(404)
      .end(done);
  });
  it('should return 404 if no todo', (done) =>{
    var id = new ObjectID;
    request(app)
      .get(`/todos/${id.toHexString()}`)
      .expect(404)
      .end(done);
  });

});

describe('DELELE /todos/:id', () => {
  it('should remove a todo', (done)=> {
    var id = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(id);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        //query the database to find by id, make sure it doesnt exist
        Todo.findById(id).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));
      });


  });
  it('should return a 404 if todo not found', (done)=> {
    var id = new ObjectID();
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done);


  });
  it('should return a 404 if object id is invalid', (done)=> {
    var id = new ObjectID() + '123';
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done);
  });
});


describe('PATCH /todos/:id', () => {
  it('should update the todo and complete to true', (done)=>{
    var id = todos[0]._id.toHexString();
    //grab id of first item
    //update text
    //set completed to to true
    //200
    //body of text, completed = true and completedAt .toBeA(number);
    var text = 'New text';
    request(app)
      .patch(`/todos/${id}`)
      .send({
        text,
        complete: true
      })
      .expect(200)
      .expect((res) => {
        // console.log(res.body);
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.complete).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });
  it('should clear completedAt when todo is not completed', (done)=>{

    var id = todos[1]._id.toHexString();
    var text = 'New text';
    request(app)
      .patch(`/todos/${id}`)
      .send({
        text,
        complete: false
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.complete).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });

});


describe('GET /users/me', ()=>{
  it('should return user if authenticated', (done) =>{
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });
  it('should return a 401 if not authenticated', (done) =>{
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users/', ()=>{
    it('should create a user', (done)=>{
      var email = 'example@example.com';
      var password = '123abc!';

      request(app)
        .post('/users')
        .send({email, password})
        .expect(200)
        .expect((res) =>{
          expect(res.headers['x-auth']).toExist();
          expect(res.body._id).toExist();
          expect(res.body.email).toBe(email);
        })
        .end((err)=>{
          if(err){
            return done(err);
          }
          User.findOne({email}).then((user)=>{
            expect(user).toExist();
            expect(user.password).toNotBe(password);
            done();
          }).catch((e) => done(e));
        });
    });
    it('should return validation errors if request is invalid', (done) =>{
      //send an invalid email, or password
      var email = 'notvalid@email';
      var password = '123'
      request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);

    });
    it('should not create user if email is in use', (done) => {
      //send a used email, one from the seed users
      var email = users[0].email;
      var password = 'validpassword';
      request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
    });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) =>{
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) =>{
        expect(res.headers['x-auth']).toExist();
      })
      .end((err,res) =>{
        if(err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) =>{
          expect(user.tokens[0]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));

      });

  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect((res) =>{
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err,res) =>{
        if(err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) =>{
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));

      });
  });
});
