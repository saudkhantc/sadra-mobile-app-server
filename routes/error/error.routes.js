import { Router } from 'express';
const router = Router();

router.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});


router.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

export default router;
