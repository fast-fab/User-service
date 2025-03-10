const express=require('express')
const app=express()
const authRoutes=require("./routes/user.auth")
const serviceRoutes=require("./routes/user.routes")

app.use(express.json())
app.use("/api/user/auth",authRoutes)
app.use("/api/user/service",serviceRoutes)

app.listen(3000)