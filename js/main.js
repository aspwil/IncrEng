//set the value of this varaible to something unique, It's what the savedata file will be named
let GAMEIDENTIFER = "IncrementalGame";
/**
 THIS IS THE ENGINE CODE
 */
let data = {
  loops: {},
  upgrades: {},
  resources: {},
  values: {}
};

data.toJSON = () => ({
  loops: data.loops,
  upgrades: data.upgrades,
  resources: data.resources,
  values: data.values
})

//shorthand object refrances
var resources = data.resources
var loops = data.resources
var upgrades = data.resources
var values = data.values


//the shared update display function
var updateDisplayFunc = function(group, identifier, property) {
  if (property === undefined) {
    //the code to update the display
    //go though each element on web page that has the data-get-resources-${identifier} property
    for (const x of document.querySelectorAll(`[data-get-${group}-${identifier}]`)) {
      //if the listed property were trying to find exists
      if (data[group][identifier].hasOwnProperty(x.getAttribute(`data-get-${group}-${identifier}`))) {
        x.innerHTML = data[group][identifier][x.getAttribute(`data-get-${group}-${identifier}`)]
      } else {
        x.innerHTML = `Unknown property: ${x.getAttribute(`data-get-${group}-${identifier}`)} @ data.${group}.${identifier}`
      }
    }
  } else {
    for (const x of document.querySelectorAll(`[data-get-${group}-${identifier}=\"${property}\"]`)) {
      //if the listed property were trying to find exists
      if (data[group][identifier].hasOwnProperty(property)) {
        x.innerHTML = data[group][identifier][property]
      } else {
        x.innerHTML = `Unknown property: ${property} @ data.${group}.${identifier}`
      }
    }
  }
}

//object constructors

//this one is not much of a constructor to be honest, just puts an entry into the values part of the data, but still adds a register
function Value(identifier, value) {
  this.val = value
  //data-get-values-identifier=""
  this.updateDisplay = function () { updateDisplayFunc("values", identifier, "val") }
  this.set = function (value) {
    this.val = value
    this.updateDisplay()
  }
  //reference
  data.values[identifier] = this
  this.toJSON = () => ({
    val: this.val
  })
}

function Loop(identifier, toCall, waitTime) {
  this.toCall = toCall
  this.waitTime = waitTime

  //ingrained functions and vlaues
  this.divisor = 1
  this.id = null
  this.updateDisplay = function (property) { updateDisplayFunc("loops", identifier, property) }
  this.start = function() {
    this.id = window.setInterval(this.toCall, this.waitTime / this.divisor)
  }
  this.stop = function() {
    clearInterval(this.id)
  }
  this.restart = function() {
    this.stop()
    this.start()
  }
  this.changeDivsor = function(newVal) {
    this.divisor = newVal
    this.restart()
  }
  //object refrances
  data.loops[identifier] = this
  this.toJSON = () => ({
    waitTime: this.waitTime,
    divisor: this.divisor
  })

}

function Resource(identifier, isUnlocked, name, desc, max) {
  this.isUnlocked = isUnlocked
  this.name = name
  this.desc = desc
  this.max = max

  //ingrained
  this.amount = 0 //not recomdnded to directly change, instead use changeAmount(), if you do directly change you need to, manualy reduce to max, call updateDisplay to actauly update text on the screen
  this.updateDisplay = function (property) { updateDisplayFunc("resources", identifier, property) }
  //change amount function, takes either a number (and changes the amount by that value)
  //or it takes a funciton that maps the current valur of amount to a new values
  //recomended to used the arrow functions like this '(x => x*2)'
  //in this way changeAmount(n) is the same as changeAmount(x => x+n)
  this.changeAmount = function(change) {
    if (typeof change == "number")
      this.amount += change
    if (typeof change == "function")
      this.amount = change(this.amount)
    this.updateDisplay("amount")
  }
  this.show = function() {
    //show code
  }
  this.hide = function() {
    //hide code
  }
  //save object refrences
  data.resources[identifier] = this
  //set the toJson for saving
  this.toJSON = () => ({
    isUnlocked: this.isUnlocked,
    amount: this.amount
  })

}

function Upgrade(identifier, name, desc, cost, unlockCon, onBaught) {
  this.name = name //the dispaly name
  this.desc = desc //the description
  this.cost = cost //the cost of the upgrade
  //cost is listed a nested array like this
  //[[resourceIdentifer, number],[resourceIdentifer, number]]
  this.unlockCon = unlockCon // a funciton that when it return true will set the upgrade to unlocked (and make it show to the user)
  this.onBaught = onBaught //the code that will be run when the upgrade is baught

  //ingraned functs and values
  this.owned = false //wether the user has baught this upgrade
  this.updateDisplay = function (property) { updateDisplayFunc("upgrades", identifier, property) }
  this.buy = function() {
    //check if player alread own this upgrade
    if (this.baught == true)
      return null
    //check if player has all the nececary resources
    for (const pair in cost)
      if (data.resources[pair[0]].amount < pair[1])
        return null
    //remove the spent resources
    for (const pair in cost)
      data.resources[pair[0]].amount -= pair[1]
    //run the user provided baught code
    this.onBaught()
    //set the ownership to true
    this.owned = true
  }
  //set the object refrance
  data.upgrades[identifier] = this
  //set the toJson for saving
  this.toJSON = () => ({
    owned: this.owned,
  })

}

//fucntions

//this function is called to start up the game and build/initilise evertything
function startGame() {
  loadSave() //load the save from localStorage
  //start all the game loops
  for (const loop in data.loops) {
    if (typeof data.loops[loop].start == "function") {
      data.loops[loop].start()
    }
  }
  //do other stuff here
}

//this function will save the games state to the web browser data
function saveGame() {
  localStorage.setItem(GAMEIDENTIFER, JSON.stringify(data))
}

//this will not save the game, just return the save data as text, useful for exporting
function getSaveDataAsText() {
  return JSON.stringify(data)
}

//this will load the save given by the text
//WARNING: this will delete the currently saved game and the save in the browser itself, then reload the page to make sure it all start correctly
function loadSaveFromText(string) {
  localStorage.setItem(GAMEIDENTIFER, string)
  startGame()
}

//WARNING: THIS WILL WIPE THE GAME SAVE DATA, and reload the page to prevent it from geting resaved
function wipeSave() {
  localStorage.removeItem(GAMEIDENTIFER)
  startGame()
}

function loadSave() {
  //get the saveData
  let loadedData = new Object()
  //for(let key in save)
}

//DEBUG: THIS COMMAND IS NOT MADE FOR GAME USE, JUST DEBUGING WHEN BUILDING THE GAME
//this will get the currenly saved data from the browser and return its text (NOT THE CURRENT GAME STATE, JUST THE LAST TIME IT WAS SAVED)
//to get the CURRENT game state for exporting saves purposes use getSaveDataAsText()
function getStoredSaveData() {
  return localStorage.getItem(GAMEIDENTIFER)
}

//DEBUG starting code



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * THIS CODE IS WHERE YOU BUILD YOUR GAME
 * you fill this block with different objects and logic
 * there is a simple default setup for you, that is currently unfinished and in dev
 * so ignore this message for now cause its probs full of testing stuff
 */
{
  new Value("goldInc", 0)
  new Resource("gold", true, "Gold", "ITS GOLD", -1)
  new Upgrade("goldInc")
  new Upgrade()
  new Loop("mainLoop", function() {
    resources.gold.changeAmount(values.goldInc.val)
  }, 1000)

}
//start the actaul engine
startGame()
