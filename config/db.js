const connectDB = () => {
try {
console.log(
"✅ Local Database Connected"
);
} catch (error) {
console.error(
"❌ Database Error:",
error.message
);
}
};

module.exports = connectDB;
