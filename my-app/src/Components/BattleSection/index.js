import React, {useState, useEffect, useCallback} from "react";
import './BattleSectionElements.css';
import {NextPageArrow} from "../ButtonElements.js";
import { useNavigate } from "react-router-dom";

function Arena(){
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [motstanderNavn, setmotstanderNavn] = useState(null);
    const [motstanderBilde, setMotstanderBilde] = useState(null);
    const [answer, setAnswer] = useState(null);
    const [svarFunnet, setSvarFunnet] = useState(false);
    const [resultText, setResultText] = useState("");
    const [robotValg, setRobotValg] = useState([]);
    const [maskinTall, setMaskinTall] = useState(null)
    const [keyPropertyBox, setKeyPropertyBox] = useState(null);
    const [maskinFarge, setMaskinFarge] = useState("black");
    const [maskinValg, setMaksinValg] = useState(null);
    const [brukerFantSvar, setBrukerFantSvar] = useState(false)
    const [score, setScore] = useState(0)
    const [KompleksitetBesvart, setKompleksitetBesvart] = useState(false);
    const [KompleksitetRigktigBesvart, setKompleksitetRigktigBesvart] = useState();
    const [kompleksitetColor, setKompleksitetColor] = useState();
    const [counter, setCounter] = useState(0);
    const [teller, setTeller] = useState(0);
    const [alleClickedElements, setAlleClickedElements] = useState([]);
    const [valgteElementer, setValgteElementer] = useState([]);
    const [algoritmeValgteElementer, setAlgoritmeValgteElementer] = useState([]);
    const [enemiesPlayed, setEnemiesPlayed] = useState([]);
    const [backtrackingList, setBacktrackingList] = useState([]); // is actually same as enemies played, holding list from frontend side
    const [spamText, setSpamText] = useState(null);
    var valgteBokser = [];
    let spilteMotstandere = [];
    let konstantTeller = 0;
    let counterRun = 0;
    const AlgorithmOptions = {
      "Tesla": "n",
      "Alan": "log(n)",
      "Kidy": "n"
    };


    const [isLoading, setIsLoading] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const INITIAL_DELAY = 2000; // Specify the initial delay in milliseconds
    const MAX_RETRIES = 3;
    const fetchData = useCallback(async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/arena?t=" + Date.now());
        const data = await res.json();
        console.log("Setting up the data");
        setData(data);
        setAnswer(data.answer);
        setmotstanderNavn(data.algorithm);
        setAlgoritmeValgteElementer(data.valgte_elementer);
        setEnemiesPlayed(data.enemies_played);
      } catch (error) {
        console.error("Error receiving arena API ", error);
        if (retryCount < MAX_RETRIES) {
          setTimeout(fetchData, INITIAL_DELAY * Math.pow(2, retryCount));
          console.log("Retries connection")
          setRetryCount(prevRetryCount => prevRetryCount + 1);
        } else {
          setIsLoading(false);
        }
      }
    }, [retryCount]);
  
    useEffect(() => {
      fetchData();
    }, [fetchData, teller]);
    
    
    
  
/*
    useEffect(() => {
      var lastPlayer = enemiesPlayed[enemiesPlayed.length-1]
      //console.log("Last player: ", lastPlayer, ", all enemies played: ", enemiesPlayed)

      if (motstanderNavn === lastPlayer){ // check whether if the choosen algorithm is right
        return;
      }

      if (motstanderNavn !== null) {
        return; // very important part: if API is fetched, we dont want to try to fetch it more, therefore return, to stay there!
      }
    
      if (motstanderNavn === null) {
        console.log("API not received, trying to fetch again")
        if (teller < 5 && teller > 0) {
          setTeller(teller + 1);
          if (motstanderNavn === lastPlayer) {
            setTeller(0); // breaking it
            return;
          }
        }
      }

    }, [teller, motstanderNavn]); // add motstanderNavn as a dependency
    */


    const checkAnswer = (event) => {
      //console.log("algoritme sine valg kommer til aa vaare: ",algoritmeValgteElementer)

      if (event.target.value == answer) {
        setSvarFunnet(true);
        setBrukerFantSvar(true)
        setResultText("You Won!")
      } else {
        setSvarFunnet(false);
        console.log("Wrong");
      }


      konstantTeller = konstantTeller +1
      while (alleClickedElements.includes(algoritmeValgteElementer[konstantTeller]) || parseInt(event.target.value) == algoritmeValgteElementer[konstantTeller]){
        konstantTeller = konstantTeller +1
        if (konstantTeller > 30){ // taking care of any infinity loops
          break;
        }
      }
      setMaskinTall(algoritmeValgteElementer[konstantTeller])
      setAlleClickedElements([...alleClickedElements, algoritmeValgteElementer[konstantTeller], parseInt(event.target.value)])
      //console.log("alle klikkede elementer: ", alleClickedElements)
      
      {maskinTall !== answer ? setSvarFunnet(false) : setSvarFunnet(true)}
      console.log("maskin valgte: ",maskinTall)
      /*
      fetch("/robot_valg", {
        method: "POST",
        body: JSON.stringify({"valgte_bokser": valgteBokser}),
        headers: {
          "Content-Type": "application/json"
        }
      }).then((res) => res.json())
        .then(robotValg => {
          setRobotValg(robotValg);
          console.log(robotValg.valg);
          setMaskinTall(robotValg.valg)
          const keyPropertyBox = maskinTall - 1;
          //console.log("key property "+keyPropertyBox + " og robot valg: " + maskinTall)
          {maskinTall !== answer ? setSvarFunnet(false) : setSvarFunnet(true)}
         
        })
        .catch(error => {
          console.error("Error receiving API robot_valg",error);
        });
        */
    };
    
  
    function checkMaskin(key){     
      if(key === maskinTall-1){
        valgteElementer.push(key)
        if(maskinTall == answer){
          return "green";
        }
        //console.log(maskinValg)
        return "red"
        
      }else{
        for (let i = 0; i < valgteElementer.length; i++){
          if (valgteElementer[i] == key){
            return "red";
          }
        }
      }
    } 
  
    const nextRound = async () => {
      const postData = {"poeng": score, "bruker_fant": brukerFantSvar};
    
      try {
        const response = await fetch('/round_results', {
          method: 'POST',
          body: JSON.stringify(postData),
          headers: {
            'Content-Type': 'application/json'
          }
        });
    
        if (response.status === 200) {
          console.log("Success");
          /*
          const data = await response.json();
    
          if (data.total_points < score) {
            await fetch('/round_results', {
              method: 'POST',
              body: JSON.stringify(postData),
              headers: {
                'Content-Type': 'application/json'
              }
            });
          }
          */
        } else {
          console.log("Error! ", response);
        }
      } catch (error) {
        console.error(error);
      }
    
      navigate('/optionpage');
    };
    
    
  
     const reloadFunction = () => {
        setSpamText("Common spam on it!")
        setData([]) // so that it can set new values on it
        setmotstanderNavn(null)
        setTeller(teller +1)
        counterRun = counterRun +1
     }
  
  
    var targetBoxes = document.getElementsByTagName("input");
    for (const element of targetBoxes){
      element.addEventListener("click", function(){
        var elementValue = this.value;
        valgteBokser.push(elementValue);
        if(elementValue == answer){
          setResultText("You Won!")
          setScore(score+10)
          this.style.backgroundColor = "green";
          setSvarFunnet(true)
          setBrukerFantSvar(true)
        }else{
          this.style.backgroundColor = "red";
          this.disabled = true; 
          setSvarFunnet(false)
        }
      });
    };
  
    const handleKompleksitet = (props) => {
      const knapp = document.getElementById(props); // henter knappen som blir trykket, så vi kan endre fargen på den
      if(AlgorithmOptions[motstanderNavn] == props || (motstanderNavn == "Kidy" && props == "1")){ // Vi godtar også randomly selection til å være 1 og n
        //console.log("Right")
        setScore(score+5)
        setKompleksitetRigktigBesvart("Right Answer")
        knapp.style.backgroundColor = "green";
      }else{
        //console.log("Wrong")
        setScore(score+0)
        setKompleksitetRigktigBesvart("Wrong")
        knapp.style.backgroundColor = "red";
      }
      setKompleksitetBesvart(true)
    }
  
    return (
      <div className='arenaContainer'>
        <div className='battleContainer'>
          <div className='top'>
            <div className='infoBattle'>
              <h2 className='ArenaHeadline'>The Arena</h2>
              {data && (
                <div className='infoContainerArena'>
                <p className='elusiveInfo'>A elusive green box is hidden behind those boxes.
                Find it before {motstanderNavn} does.
                </p>
                <p className='gameTips'>Some robots receive signals indicating the location of a hidden green box every time they reveal a box. 
                  To increase your chances of success, it may be beneficial to crack the algorithm beforehand.</p>
                <p className='gameTips'>Click on any box to start the game. It is randomly determined who will start.</p>
                <img src={motstanderBilde} />
              </div>
              )}
            </div>
          </div>
          <div className='middle'>
            <div className='boxesContainer'>
              {(typeof data.gameboard === 'undefined' || data.algorithm == "") ? (
                <div>
                  <p>Your enemy is trying to attack you, stay calm and don't let them play any mental tricks on you. Try breaking the wall. </p>
                  <p style={{fontWeight: 600, color: "#444"}}>{spamText}</p>
                  <button onClick={() => reloadFunction()} style={{color: "red", fontWeight: 600, backgroundColor: "brown", padding: "5px"}}>BLOCK</button>
                </div>
              ) : (
                data.gameboard.map((gameboard, i) => (
                  <div className='boxes' key={i}>
                    <input 
                      className='btnBoxes' 
                      onClick={checkAnswer} 
                      type="button" 
                      id={"targetBox" + i} 
                      value={gameboard} 
                      disabled={svarFunnet || maskinTall == answer} 
                      style={{backgroundColor: checkMaskin(i)}} 
                    />
                  </div>
                ))
              )}
            </div>
          </div>
          <div className='bottom battleBottomSection'>
                {svarFunnet || maskinTall == answer ? 
                <div className='timeComplexityContainer'>
                  <h1 className='GainPointsT'>Gain some extra points</h1>
                  <p className='timeComplexityText'>What is the time complexity of the algorithm utilized by {motstanderNavn}</p>
                  <div className='timeComplexityOptionsContainer'>
                    <button className='complexityOption1 timeComplexityBtn' id='1' onClick={() => handleKompleksitet("1")} disabled={KompleksitetBesvart}>1</button>
                    <button className='complexityOption1 timeComplexityBtn' id='n' onClick={() => handleKompleksitet("n")} disabled={KompleksitetBesvart}>n</button>
                    <button className='complexityOption1 timeComplexityBtn' id='log(n)' onClick={() => handleKompleksitet("log(n)")} disabled={KompleksitetBesvart}>log(n)</button>
                    <button className='complexityOption1 timeComplexityBtn' id='n*log(n)' onClick={() => handleKompleksitet("n*log(n)")} disabled={KompleksitetBesvart}>n*log(n)</button>
                  </div>
                  <div className='timeComplexityOptionsContainer'>
                    <button className='complexityOption1 timeComplexityBtn' id='n*m^2' onClick={() => handleKompleksitet("n*m^2")} disabled={KompleksitetBesvart}>n*m^2</button>
                    <button className='complexityOption1 timeComplexityBtn' id='log(n^2)' onClick={() => handleKompleksitet("log(n^2)")} disabled={KompleksitetBesvart}>log(n^2)</button>
                    <button className='complexityOption1 timeComplexityBtn' id='n*log(n^2)' onClick={() => handleKompleksitet("n*log(n^2)")} disabled={KompleksitetBesvart}>n*log(n^2)</button>
                    <button className='complexityOption1 timeComplexityBtn' id='n^3' onClick={() => handleKompleksitet("n^3")} disabled={KompleksitetBesvart}>n^3</button>
                  </div>
                  <p className='resultComplexityAnswerT'>{KompleksitetRigktigBesvart}</p>
                </div>
                : 
                <p></p>
                }
            <div className='algorithmChoiceContainer'>
                  {maskinTall == null ? <p></p> : <p className='choseText'>{motstanderNavn} chose box number: {maskinTall}</p>}
            </div>
            <div className='resultater'>
            <h1 className='resultText'>{resultText} {maskinTall == answer ?<div> <p>The Algorithm Won</p><div className='scoreText'><p className='ArenaHeadline'>Points + {score} </p></div></div> 
            : <p></p>}</h1>
            {svarFunnet ?
            <div className='scoreText'><p className='ArenaHeadline'>Points + {score} </p></div>
            :
            <p></p>}
            </div>
            {svarFunnet || maskinTall == answer ?  <div className='nextBtnContainer'><button className='nextBtn' onClick={nextRound}>Next <NextPageArrow /> </button></div>:
              <></>
            }
          </div>
        </div>
      </div>
    );
}

export default Arena;