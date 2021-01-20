import { Router }  from 'express';

const router = Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json([]);
});

router.get('/:id', function(req, res, next) {
  res.json([]);
});

router.post('/', function(req, res, next) {
  res.json([]);
});

router.put('/:id', function(req, res, next) {
  res.json([]);
});

router.delete('/:id', function(req, res, next) {
  res.json([]);
});

export default router;
