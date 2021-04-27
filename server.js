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

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/deep-thoughts",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }
);

app.get("/api/workouts", (req, res) => {
  db.Workout.aggregate(
    [
      {
        $addFields: {
          totalDuration: { $sum: "$exercises.duration" },
        },
      },
    ],
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.json(result);
      }
    }
  );
});

app.put("/api/workouts/:id", (req, res) => {
  db.Workout.findById(mongoose.Types.ObjectId(req.params.id))
    .then((dbWorkout) => {
      console.log(dbWorkout);
      const { exercises } = dbWorkout;
      exercises.push(req.body);
      console.log(exercises);
      dbWorkout.save(function (err) {
        if (err) return handleError(err);
      });
      res.json(dbWorkout);
    })
    .catch((err) => {
      res.json(err);
    });
});

app.get("/exercise", (req, res) => {
  res.sendFile(__dirname + "/public/exercise.html");
});

app.get("/stats", (req, res) => {
  res.sendFile(__dirname + "/public/stats.html");
});

app.post("/api/workouts", (req, res) => {
  const dbWorkout = new db.Workout(req.body);
  dbWorkout.save(function (err) {
    if (err) return handleError(err);
  });

  res.json(dbWorkout);
});

app.get("/api/workouts/range", (req, res) => {
  db.Workout.aggregate(
    [
      {
        $addFields: {
          totalDuration: { $sum: "$exercises.duration" },
        },
      },
    ],
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        let lastSeven;
        if (result.length > 7) {
          lastSeven = result.filter(
            (workout, index) => index >= result.length - 7
          );
        } else {
          lastSeven = result;
        }
        res.json(lastSeven);
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
