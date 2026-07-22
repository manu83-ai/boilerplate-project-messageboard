const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  // Variables globales para almacenar IDs y contraseñas creadas durante las pruebas
  let testBoard = 'test_board_fcc';
  let testThreadId;
  let testReplyId;
  const deletePassword = 'pass123_test';

  suite('API ROUTING FOR /api/threads/:board', function() {

    // 1. Crear un nuevo hilo: POST request to /api/threads/{board}
    test('Creating a new thread: POST request to /api/threads/{board}', function(done) {
      chai.request(server)
        .post(`/api/threads/${testBoard}`)
        .send({
          text: 'Hilo de prueba funcional',
          delete_password: deletePassword
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          // Si tu app redirige al HTML del board tras crear, res.body o la respuesta es válida
          done();
        });
    });

    // 2. Ver los 10 hilos más recientes con 3 respuestas cada uno: GET request to /api/threads/{board}
    test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', function(done) {
      chai.request(server)
        .get(`/api/threads/${testBoard}`)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAtMost(res.body.length, 10);

          // Guardamos un _id válido para usarlo en las pruebas siguientes
          if (res.body.length > 0) {
            testThreadId = res.body[0]._id;
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'bumped_on');
            assert.property(res.body[0], 'replies');
            assert.notProperty(res.body[0], 'delete_password');
            assert.notProperty(res.body[0], 'reported');
            assert.isAtMost(res.body[0].replies.length, 3);
          }
          done();
        });
    });

    // 3. Reportar un hilo: PUT request to /api/threads/{board}
    test('Reporting a thread: PUT request to /api/threads/{board}', function(done) {
      chai.request(server)
        .put(`/api/threads/${testBoard}`)
        .send({ thread_id: testThreadId })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
        });
    });

    // 4. Eliminar un hilo con contraseña incorrecta: DELETE request to /api/threads/{board}
    test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board}', function(done) {
      chai.request(server)
        .delete(`/api/threads/${testBoard}`)
        .send({
          thread_id: testThreadId,
          delete_password: 'wrong_password_123'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

  });

  suite('API ROUTING FOR /api/replies/:board', function() {

    // 5. Crear una nueva respuesta: POST request to /api/replies/{board}
    test('Creating a new reply: POST request to /api/replies/{board}', function(done) {
      chai.request(server)
        .post(`/api/replies/${testBoard}`)
        .send({
          thread_id: testThreadId,
          text: 'Respuesta de prueba funcional',
          delete_password: deletePassword
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          done();
        });
    });

    // 6. Ver un hilo completo con todas las respuestas: GET request to /api/replies/{board}
    test('Viewing a single thread with all replies: GET request to /api/replies/{board}', function(done) {
      chai.request(server)
        .get(`/api/replies/${testBoard}`)
        .query({ thread_id: testThreadId })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, '_id');
          assert.property(res.body, 'replies');
          assert.isArray(res.body.replies);
          assert.notProperty(res.body, 'delete_password');
          assert.notProperty(res.body, 'reported');

          // Guardamos el reply_id para las siguientes pruebas
          if (res.body.replies.length > 0) {
            const lastReply = res.body.replies[res.body.replies.length - 1];
            testReplyId = lastReply._id;
            assert.notProperty(lastReply, 'delete_password');
            assert.notProperty(lastReply, 'reported');
          }
          done();
        });
    });

    // 7. Reportar una respuesta: PUT request to /api/replies/{board}
    test('Reporting a reply: PUT request to /api/replies/{board}', function(done) {
      chai.request(server)
        .put(`/api/replies/${testBoard}`)
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
        });
    });

    // 8. Eliminar una respuesta con contraseña incorrecta: DELETE request to /api/replies/{board}
    test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board}', function(done) {
      chai.request(server)
        .delete(`/api/replies/${testBoard}`)
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId,
          delete_password: 'wrong_password_123'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    // 9. Eliminar una respuesta con contraseña correcta: DELETE request to /api/replies/{board}
    test('Deleting a reply with the correct password: DELETE request to /api/replies/{board}', function(done) {
      chai.request(server)
        .delete(`/api/replies/${testBoard}`)
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId,
          delete_password: deletePassword
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
    });

    // 10. Eliminar un hilo con la contraseña correcta: DELETE request to /api/threads/{board}
    test('Deleting a thread with the correct password: DELETE request to /api/threads/{board}', function(done) {
      chai.request(server)
        .delete(`/api/threads/${testBoard}`)
        .send({
          thread_id: testThreadId,
          delete_password: deletePassword
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
    });

  });

});