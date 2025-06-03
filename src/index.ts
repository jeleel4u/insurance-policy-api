import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Insure-API Backend Service is running on port ${PORT}`);
    console.log(`Health check at http://localhost:${PORT}/health`);
    console.log(`Policies API Base URL: http://localhost:${PORT}/policies`);
    console.log(`Policies API  Documentation URL: http://localhost:${PORT}/api-docs`);
});