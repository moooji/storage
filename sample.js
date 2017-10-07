const createStorage = require('./index');

const storage = createStorage({
  projectId: 'bloggsta-181813',
  bucket: 'test-bucket'
});

save();

async function save() {
  const key = 'test-key';
  const buffer = readFile("./assets/image.jpg");
  const mimeType = 'image/jpeg';

  const res = await storage.save(key, buffer, mimeType);
  console.log(res);
}