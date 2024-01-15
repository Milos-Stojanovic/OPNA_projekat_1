import React, { useState } from 'react';

class Fraction {
  constructor(p, q, alfa) {
    this.p = p;
    this.q = q;
    this.alfa = alfa
    this.coefficients = [];
    this.isFirst = false
    this.isSecond = false
    this.errorValue = Math.abs(this.alfa - this.p/this.q)
    this.calculateContinuedFractionRepresentation()
  }

  calculateContinuedFractionRepresentation() { // postupak racunanja veriznih decimala
    let x = this.p / this.q;
    let a = Math.floor(x);
    let d = x - a;

    this.coefficients.push(a);
    while(d > 1e-8){ 
      
      x = 1 / d;
      a = Math.floor(x);
      d = x - a;
      this.coefficients.push(a);
    }

    // ukoliko je poslednja verizna decimala 1, izbaci je i prethodnu veriznu decimalu povecaj za 1
    if (this.coefficients[this.coefficients.length - 1] == 1){ 
      this.coefficients.pop();
      if (this.coefficients.length == 0) // ukoliko je 1 bila prva i poslednja verizna decimala
        this.coefficients.push(1);
      else
        this.coefficients[this.coefficients.length - 1] += 1;
    }
  }

  displayContinuedFractionRepresentation() {
    // formatiraj verizne decimale za pravilan ispis
    let coefficientsDisplay = "";
    for (let i = 0; i < this.coefficients.length; i++){
      coefficientsDisplay += this.coefficients[i];
      if (i == 0) {
        coefficientsDisplay += "; "
      }
      else {
        coefficientsDisplay += ", "
      }
    }
    coefficientsDisplay = coefficientsDisplay.slice(0, -2)

    return "[" + coefficientsDisplay + "]";
  }

}


// komponenta koja sluzi za ispis rezultata racunanja
const MyTable = ({ data }) => {

  // slucaj da jos uvek nije izracunat rezultat programa
  if (!data || !Array.isArray(data)) {
    return <div></div>;
  }
  
  // filtriranje najboljih racionalnih aproksimacija I i II vrste
  let fractionsTypeII = [];
  let fractionsTypeI = [];
  for (let i = 0; i < data.length; i++){

    if (data[i].isSecond){
      fractionsTypeII.push(data[i]);
    }

    if (data[i].isFirst){
      fractionsTypeI.push(data[i]);
    }

  }

  // sortiranje racionalnih aproksimacija rastuce po vrednosti imenionca
  fractionsTypeI.sort((a, b) => a.q - b.q);
  fractionsTypeII.sort((a, b) => a.q - b.q);


  // formiranje stringa za sortirani ispis razlomaka koji predstavljaju najbolje racionalne aproksimacije
  let fractionsII = "";
  for (let i = 0; i < fractionsTypeII.length; i++){
    fractionsII = fractionsII + `${fractionsTypeII[i].p}/${fractionsTypeII[i].q}` + ", "
  }
  fractionsII = fractionsII.slice(0, -2);

  let fractionsI = "";
  for (let i = 0; i < fractionsTypeI.length; i++){
    fractionsI = fractionsI + `${fractionsTypeI[i].p}/${fractionsTypeI[i].q}` + ", "
  }
  fractionsI = fractionsI.slice(0, -2);


  return (
    <>
      <div>
        <div style={{marginTop: 30, marginBottom: 10, fontSize: 22}}>Najbolje racionalne aproksimacije I vrste su {fractionsI}</div>
        <div style={{marginBottom: 15, fontSize: 22, textAlign: "left"}}>Najbolje racionalne aproksimacije II vrste su {fractionsII}</div>
      </div>
      <div style={{marginTop: 20, marginBottom: 10, fontSize: 22}}>Svi redukovani razlomci sortirani po rastućoj vrednosti apsolutne greške su dati tabelom:</div>
      <table style={{fontSize: 20}}>
        {/* Table header */}
        <thead>
          <tr>
            <th style={{width: 100}}>Razlomak</th>
            <th style={{width: 300}}>Verižne decimale</th>
            <th style={{width: 200}}>|α-p/q|</th>
            <th style={{width: 150}}>Vrsta</th>
          </tr>
        </thead>
        {/* Table body */}
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td style={{textAlign: "center"}}>{`${item.p}/${item.q}`}</td>
              <td style={{textAlign: "left", paddingLeft: 100}}>{item.displayContinuedFractionRepresentation()}</td>
              <td style={{textAlign: "right"}}>{item.errorValue.toFixed(15)}</td>
              <td style={{textAlign: "center"}}>{item.isSecond ? "II" : item.isFirst ? "I" : "N"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

const App = () => {
  // State to store input values
  // const [textBox1Value, setTextBox1Value] = useState('');
  // const [textBox2Value, setTextBox2Value] = useState('');
  const [N, setN] = useState("")
  const [M, setM] = useState("")
  const [alfa, setAlfa] = useState("")
  const [inputDisabled, setInputDisabled] = useState(false);
  let M1, N1;
  const [data, setData] = useState(null);


  function tryParseN(val) {
    let n = parseInt(val, 10)
    
    if (isNaN(n) || n <= 0) {
      alert("Za broj N nije uneta ispravna brojčana vrednost!")
      return false;
    }
    setN(n) 
  }


  function tryParseM(val) {
    let m = parseInt(val, 10)
    
    if (isNaN(m)) {
      alert("Za broj M nije uneta ispravna brojčana vrednost!")
      return false;
    }
    setM(m) 
  }
  

  // funkcija za regulisanje pravilnog unosa alfa, N i M parametara
  const handleInput = () => {

    if (isNaN(alfa)) {
      alert("Za broj alfa nije uneta ispravna brojčana vrednost!")
      return;
    }
    if (isNaN(N) || N <= 0) {
      alert("Za broj N nije uneta ispravna brojčana vrednost!")
      return false;
    }
    if (isNaN(M)) {
      alert("Za broj M nije uneta ispravna brojčana vrednost!")
      return false;
    }
    if (M <= N) {
      alert("Nisu unete ispravne brojčane vrednosti, mora da važi M >= N!")
      return false;
    }
    
    return true;
  }

  function calculateErrTypeI(alfa, p, q){
    return Math.abs(alfa - p / q)
  }

  function calculateErrTypeII(alfa, p, q){
    return Math.abs(alfa * q - p)
  }

  const determineIfFirstOrSecond = (alfa, q, fractions) => {
    let minErrTypeI = 1e12;
    let minErrTypeII = 1e12;

    for(let s = 1; s < q; s++){
      // I
      let r = Math.round(alfa * s)
      if (s == 1){
        minErrTypeI = calculateErrTypeI(alfa, r, s)
      }
      let currentErr = calculateErrTypeI(alfa, r, s)
      if (currentErr < minErrTypeI){
        minErrTypeI = currentErr
      }

      // II
      if (s == 1){
        minErrTypeII = calculateErrTypeII(alfa, r, s)
      }
      currentErr = calculateErrTypeII(alfa, r, s)
      if (currentErr < minErrTypeII){
        minErrTypeII = currentErr
      }
    }
  
    for (let i = 0; i < fractions.length; i++) {
      let currentErr = calculateErrTypeII(alfa, fractions[i].p, fractions[i].q);

      if (currentErr < minErrTypeII){
        minErrTypeII = currentErr
        fractions[i].isSecond = true;
        fractions[i].isFirst = true;
        currentErr = calculateErrTypeI(alfa, fractions[i].p, fractions[i].q);
        if (currentErr < minErrTypeI){
          minErrTypeI = currentErr;
        }
      }

      else{ 
        fractions[i].isSecond = false;
        currentErr = calculateErrTypeI(alfa, fractions[i].p, fractions[i].q);
        if (currentErr < minErrTypeI) {
          minErrTypeI = currentErr;
          fractions[i].isFirst = true;
        }
        else {
          fractions[i].isFirst = false;
        }
      }
    }
  
  }

  // Funkcija koja se poziva klikom na dugme "Izracunaj"
  const handleButtonClick = () => {
    
    // provera da li su uneti ispravni podaci
    let inputValid = handleInput();
    if(!inputValid){
      return;
    }
    setInputDisabled(true);

    // Formiranje dinamickog niza razlomaka
    let fractions = [] 
    for(let i = N; i <= M; i++){
      if (gcd(Math.round(  alfa * i), i) != 1){
        continue; // Neredukovani razlomak, nama je visak
      }
      let fraction = new Fraction(Math.round( alfa * i), i, alfa);
      fractions.push(fraction)
    }
    // proveri za sve razlomke da li su najbolja racionalna aproksimacija I/II vrste
    determineIfFirstOrSecond(alfa, N, fractions)
    // sortiramo razlomke po uslovu minimalnosti apsolutne greske
    fractions.sort((a, b) => Math.abs(a.errorValue) - Math.abs(b.errorValue));

    M1 = M;
    N1 = N;
    // postavljamo sortirane razlomke za ispis u tabeli
    setData(fractions)
  };

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
  
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
  
    return a;
  }


  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "20vh"}}>
      <label style={{fontSize: 20}}>
        Unesite vrednost alfa: 
        <input
          style={{marginLeft: 10, fontSize: 20}}
          type="text"
          value={alfa}
          disabled={inputDisabled}
          onChange={(e) => { setAlfa(e.target.value);}}
        />
      </label>
      <br />
      <label style={{fontSize: 20}}>
        Unesite vrednost N: 
        <input
          style={{marginLeft: 10, fontSize: 20}}
          type="text"
          value={N}
          disabled={inputDisabled}
          onChange={(e) => { tryParseN(e.target.value);}}
        />
      </label>
      <br />
      <label style={{fontSize: 20}}>
        Unesite vrednost M:
        <input
        style={{marginLeft: 10, fontSize: 20}}
          type="text"
          value={M}
          disabled={inputDisabled}
          onChange={(e) => { tryParseM(e.target.value);}}
        />
      </label>
      <br />
      <div style={{display: "flex", direction: "row"}}>
        <button
          style={{width: 150, height: 50, fontSize: 20, marginRight: 25}}
          disabled={inputDisabled}
          onClick={handleButtonClick}>Izračunaj
        </button>
        <button
        style={{width: 150, height: 50, fontSize: 20}}
        disabled={!inputDisabled}
        onClick={() => {window.location.reload()}}>Resetuj formu
      </button>
      </div>

      <MyTable data={data} />
    </div>
  );
};

export default App;
