const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;

const db = require("./models");
const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout", {
  useNewUrlParser: true,
});

// app.post("/submit", ({ body }, res) => {
//   User.create(body)
//     .then((dbUser) => {
//       res.json(dbUser);
//     })
//     .catch((err) => {
//       res.json(err);
//     });
// });

app.get("/api/workouts", (req, res) => {
  db.Workout.find({})
    .then((dbWorkout) => {
      for (let k = 0; k < dbWorkout.length; k++) {
        let duration = 0;
        for (let i = 0; i < dbWorkout[k].exercises.length; i++) {
          duration += dbWorkout[k].exercises[i].duration;
        }
        dbWorkout[k]._doc = { ...dbWorkout[k]._doc, totalDuration: duration };
        console.log(dbWorkout[k]);
      }
      res.json(dbWorkout);
    })
    .catch((err) => {
      res.json(err);
    });
});

app.get("/exercise?id=:id", (req, res) => {
  db.Workout.findById(req.params.id)
    .then((dbExercise) => {
      res.json(dbExercise);
    })
    .catch((err) => {
      res.json(err);
    });
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
