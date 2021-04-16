import React, { useEffect, useState } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

/** List of jokes. */

function JokeList(props) {

    const [jokes, setJokes] = useState([])
    const [isLoading, setIsLoading] = useState(true)

  /* at mount, get jokes */

  useEffect(function() {
      async function grabAndSetJokes() {
          const jokesFromApi = await getJokes()
          setJokes(jokesFromApi)
      }
      grabAndSetJokes()
  }, [])

  /* retrieve jokes from API */

  async function getJokes() {
    try {
      // load jokes one at a time, adding not-yet-seen jokes
      let jokesArr = [];
      let seenJokes = new Set();

      while (jokesArr.length < props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let { ...joke } = res.data;

        if (!seenJokes.has(joke.id)) {
          seenJokes.add(joke.id);
          jokesArr.push({ ...joke, votes: 0 });
        } else {
          console.log("duplicate found!");
        }
      }

      setIsLoading(false)
      return jokesArr
    } catch (err) {
      console.error(err);
    }
  }

  /* empty joke list, set to loading state, and then call getJokes */

  async function generateNewJokes() {
      setJokes([])
      setIsLoading(true)
      const jokesFromApi = await getJokes()
      setJokes(jokesFromApi)
  }

  /* change vote for this id by delta (+1 or -1) */

  function vote(id, delta) {
    setJokes(jokes.map(j =>
        j.id === id ? { ...j, votes: j.votes + delta } : j
      )
    );
  }

  
  
/* render: either loading spinner or list of sorted jokes. */
return (
    <>
        {isLoading ? 
            (

                <div className="loading">
                <i className="fas fa-4x fa-spinner fa-spin" />
                </div>

            ) : (
                <div className="JokeList">
                    <button
                    className="JokeList-getmore"
                    onClick={generateNewJokes}
                    >
                    Get New Jokes
                    </button>

                    {jokes.sort((a, b) => b.votes - a.votes).map(j => (
                    <Joke
                        text={j.joke}
                        key={j.id}
                        id={j.id}
                        votes={j.votes}
                        vote={vote}
                    />
                    ))}
                </div>
            )
        }
    </>
)
}

JokeList.defaultProps = {
    numJokesToGet: 5
}

export default JokeList;
