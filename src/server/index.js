import express            from 'express';

const app  = express();

app.get('/', ( req, res ) => {
  process.send({ cmd : 'notifyRequest' });
  res.send(`Hello World from worker ${process.pid}`);
});

app.listen(process.env.PORT || 8000);

export default app;