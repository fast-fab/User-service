const express=require('express')
const app=express()
const authRoutes=require("./routes/user.auth")
console.log("qwer")
app.use(express.json())
app.use("/api/user/auth",authRoutes)

app.listen(3000)