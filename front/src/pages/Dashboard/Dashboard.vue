<template>
  <div class="main">

    <div>
      This extension is only working when opened in a popup.
      <button @click="triggerPopup">Open in popup</button>
      <br>
      Before a new game, reset the data.
      <button @click="reset">Reset</button>
      <br>
      Your username: <input id="inputUsername" type="text" :value="allData.currentUsername" placeholder="Enter your username" />
      &nbsp;
      <button @click="saveCurrentUsername()">Save</button>
      <br>
      <br>
      <h2>Catan Card Tracker</h2>
    </div>

    <div class="row">
      <div
        v-for="(player, index) in allData.players"
        :key="player.id"
      >
        <div class="col">
          <span :style="`color:${player.color}`">{{player.name}} <span v-if="player.you"> (you)</span></span>
          <color-selector @value="setValue($event, index)"/>
        </div>
      </div>
    </div>

    <br>

    <div class="row">
      <div v-if="allData.robbingPlayer || allData.robbingPlayer === 0">
        <span :style="`color:${allData.players[allData.robbingPlayer].color}`" >Player {{ allData.robbingPlayer + 1 }}</span> is robbing
        <dropdown
          :options="playersWithoutRobber"
          trackBy="id"
          label="name"
          :multiple="false"
          :arrayOfStrings="false"
          description="Player"
          @value="pickedPlayer"
        />
        <br>
      </div>
    </div>

    <div class="row">
      <div v-if="allData.monopolyPlayer || allData.monopolyPlayer === 0">
        <span :style="`color:${allData.players[allData.monopolyPlayer].color}`" >Player {{ allData.monopolyPlayer + 1 }}</span> is using monopoly on
        <dropdown
          :options="allData.icons"
          trackBy="name"
          label="name"
          :multiple="false"
          :arrayOfStrings="false"
          description="Ressource"
          @value="pickedRessource"
        />
        <br>
      </div>
    </div>

    <div
      v-for="(player, index) in allData.players"
      :key="player.id"
    >
      <div 
        v-if="player.color"
        class="row"
      >
        <div>
          <div class="colorBox" :style="`background-color:${player.color}`"></div>
          <div class="inline">
            <div
              v-for="action in allData.actions"
              :key="action.name"
            >
              <a @click="runAction(action.name, index)">
                <img
                  class="icon"
                  :src="getImageSource('actions', action.name)"
                  :alt="action.name"
                />
              </a>
            </div>
          </div>
          <div
            v-for="icon in allData.icons"
            :key="icon.name"
          >
            <div class="inline">
              <img
                class="icon"
                :src="getImageSource('icons', icon.name)"
                :alt="icon.name"
              /> 
              {{ player.cards[icon.name] }}
              <b-button 
                variant="outline-secondary"
                size="sm"
                @click="inflateCardCount('plus', index, icon.name)"
              >
                +
              </b-button>
              <b-button 
                variant="outline-secondary"
                size="sm"
                @click="inflateCardCount('minus', index, icon.name)"
              >
                -
              </b-button>
              <b-button
                variant="outline-secondary"
                size="sm"
                @click="showModal('change-value', index, icon.name)"
              >
                Change
              </b-button>
            </div>
          </div>
        </div>
      </div>
      <br>
    </div>

    <div v-if="allData && allData.messages">
      <span 
        v-for="message in allData.messages"
        :key="message"
      >
        {{ message }}
        <br>
      </span>
    </div>

    <b-modal ref="change-value" hide-footer title="Change value">
      <b-form-input id="newValue" type="number" v-model="allData.ressourceValue"></b-form-input>
      <b-button class="mt-3" variant="outline-success" @click="saveNewValue('change-value')">Save</b-button>
    </b-modal>

    <footer>
      Catan Card Tracker &copy; 2023
    </footer>
  </div>
</template>

<script>

import ColorSelector from '../../components/ColorSelector/ColorSelector';
import Dropdown from '../../components/Dropdown/Dropdown.vue';

export default {
  name: 'DashboardPage',
  components: {
    ColorSelector,
    Dropdown
  },
  data() {
    return {
      allData: {
        messages: [],
        robbingPlayer: false,
        monopolyPlayer: false,
        ressourceValue: 0,
        playersWhoHaveBeenSetup: {},
        numberOfPlayersWhoHaveBeenSetup: 0,
        youIndex: null,
        currentUsername: null,
        players: [
          {
            id: 1,
            name: "Player 1",
            color: null,
            you: false,
            cards: {
              lumber: 0,
              brick: 0,
              wool: 0,
              grain: 0,
              ore: 0
            }
          },
          {
            id: 2,
            name: "Player 2",
            color: null,
            you: false,
            cards: {
              lumber: 0,
              brick: 0,
              wool: 0,
              grain: 0,
              ore: 0
            }
          },
          {
            id: 3,
            name: "Player 3",
            color: null,
            you: false,
            cards: {
              lumber: 0,
              brick: 0,
              wool: 0,
              grain: 0,
              ore: 0
            }
          },
          {
            id: 4,
            name: "Player 4",
            color: null,
            you: false,
            cards: {
              lumber: 0,
              brick: 0,
              wool: 0,
              grain: 0,
              ore: 0
            }
          }
        ],
        icons: [
          {
            name: "lumber"
          },
          {
            name: "brick"
          },
          {
            name: "wool"
          },
          {
            name: "grain"
          },
          {
            name: "ore"
          },
        ],
        actions: [
          {
            name: "road"
          },
          {
            name: "settlement"
          },
          {
            name: "city"
          },
          {
            name: "development"
          },
          {
            name: "robber"
          },
          { 
            name: "yearsofplenty"
          },
          {
            name: "monopoly"
          }
        ],
        modalValue: {
          index: null,
          ressource: null
        }
      }
    }
  },
  created() {
    if (chrome && chrome.storage) {
      chrome.storage.local.get(["allData"]).then((result) => {
        if (result && result.allData) {
          this.allData = Object.assign({}, {...this.allData}, {...result.allData})
        }
      });

      const that = this

      chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          /* if (request.loggedInUsername) {
            console.log(request.loggedInUsername)
            that.allData.players[3].name = request.loggedInUsername + ' (you)'
          } */
          if (request.username && !that.allData.playersWhoHaveBeenSetup[request.username]) {
            that.allData.players[that.allData.numberOfPlayersWhoHaveBeenSetup].color = request.color
            that.allData.players[that.allData.numberOfPlayersWhoHaveBeenSetup].name = request.username
            if (request.username === that.allData.currentUsername) {
              that.allData.players[that.allData.numberOfPlayersWhoHaveBeenSetup].you = true
              that.allData.youIndex = that.allData.numberOfPlayersWhoHaveBeenSetup
            }
            that.allData.playersWhoHaveBeenSetup[request.username] = { index: that.allData.numberOfPlayersWhoHaveBeenSetup }
            that.allData.numberOfPlayersWhoHaveBeenSetup++
          }

          that.allData.messages.push(request.color + ' ' + request.username + ' ' + request.events)
          that.interpret({username: request.username, events: request.events})

          sendResponse({});
        }
      );
    }
  },
  watch: {
    allData: {
      deep: true,
      handler(val) {
        if (chrome && chrome.storage) {
          chrome.storage.local.set({ allData: {...val} }).then(() => {
            chrome.storage.local.get(["allData"]).then((result) => {

            });
          });
        }
      }
    }
  },
  computed: {
    playersWithoutRobber() {
      const playersWithoutRobber = this.allData.players.filter((player, index) => {
        if ((index !== this.allData.robbingPlayer) && player.color) return true;
      })
      return playersWithoutRobber;
    }
  },
  methods: {
    setValue(v, number) {
      this.allData.players[number].color = `#${v.hex}`
    },
    pickedPlayer(v, robbedPlayer, robbingPlayer) {
      const robbedPlayerIndex = (robbedPlayer || robbedPlayer === 0) ? robbedPlayer : this.allData.players.findIndex(player => player.id === v.id);
      const robbingPlayerIndex = (robbingPlayer || robbingPlayer === 0) ? robbingPlayer : this.allData.robbingPlayer
      const robberProbability = this.loseFromRobber(robbedPlayerIndex);
      for (const cardName in this.allData.players[robbingPlayerIndex].cards) {
        this.inflateCardCount("plus", robbingPlayerIndex, cardName, robberProbability[cardName]);
        this.roundTo2DecimalPlaces(robbingPlayerIndex, cardName);
      }
      this.allData.robbingPlayer = false;
    },
    pickedRessource(v) {
      const ressource = v.name
      for (let i=0; i < this.allData.players.length; i++) {
        const player = this.allData.players[i]
        if (player.id !== this.allData.monopolyPlayer + 1) {
          if (player.cards[ressource]) {
            this.inflateCardCount("plus", this.allData.monopolyPlayer, ressource, player.cards[ressource]);
            this.roundTo2DecimalPlaces(this.allData.monopolyPlayer, ressource);
            this.inflateCardCount("minus", player.id - 1, ressource, player.cards[ressource]);
            this.roundTo2DecimalPlaces(player.id - 1, ressource);
          }
        }
      }
      this.allData.monopolyPlayer = false;
    },
    getImageSource(type, iconName, format = 'png') {
      return require(`../../../public/${type}/${iconName}.${format}`)
    },
    inflateCardCount(type, playerIndex, iconName, value = 1) {
      if (type === "plus") {
        this.allData.players[playerIndex].cards[iconName] += value;
      }
      if (type === "minus") {
        this.allData.players[playerIndex].cards[iconName] -= value;
        if (this.allData.players[playerIndex].cards[iconName] < 0) this.allData.players[playerIndex].cards[iconName] = 0;
      }
      this.roundTo2DecimalPlaces(playerIndex, iconName);

    },
    loseFromRobber(playerIndex) {
      const robberProbability = {};
      let playerTotalCards = 0;
      for (const cardName in this.allData.players[playerIndex].cards) {
        playerTotalCards += this.allData.players[playerIndex].cards[cardName];
      }
      for (const cardName in this.allData.players[playerIndex].cards) {
        const probability = this.allData.players[playerIndex].cards[cardName] / playerTotalCards;
        robberProbability[cardName] = isNaN(probability) ? 0 : probability;
        this.inflateCardCount("minus", playerIndex, cardName, robberProbability[cardName]);
        this.roundTo2DecimalPlaces(playerIndex, cardName);
      }
      return robberProbability;
    },
    roundTo2DecimalPlaces(playerIndex, cardName) {
      this.allData.players[playerIndex].cards[cardName] = Math.round((this.allData.players[playerIndex].cards[cardName] + Number.EPSILON) * 100) / 100;
    },
    runAction(type, playerIndex) {
      if (type === "road") {
        this.inflateCardCount("minus", playerIndex, "lumber");
        this.inflateCardCount("minus", playerIndex, "brick");
      }
      if (type === "settlement") {
        this.inflateCardCount("minus", playerIndex, "lumber");
        this.inflateCardCount("minus", playerIndex, "brick");
        this.inflateCardCount("minus", playerIndex, "wool");
        this.inflateCardCount("minus", playerIndex, "grain");
      }
      if (type === "city") {
        this.inflateCardCount("minus", playerIndex, "grain");
        this.inflateCardCount("minus", playerIndex, "grain");
        this.inflateCardCount("minus", playerIndex, "ore");
        this.inflateCardCount("minus", playerIndex, "ore");
        this.inflateCardCount("minus", playerIndex, "ore");
      }
      if (type === "development") {
        this.inflateCardCount("minus", playerIndex, "wool");
        this.inflateCardCount("minus", playerIndex, "grain");
        this.inflateCardCount("minus", playerIndex, "ore");
      }
      if (type === "robber") {
        if (this.allData.robbingPlayer === playerIndex) {
          this.allData.robbingPlayer = false
        } else {
          this.allData.robbingPlayer = playerIndex
        }
      }
      if (type === "yearsofplenty") {
        this.inflateCardCount("plus", playerIndex, "lumber", 0.4);
        this.inflateCardCount("plus", playerIndex, "brick", 0.4);
        this.inflateCardCount("plus", playerIndex, "wool", 0.4);
        this.inflateCardCount("plus", playerIndex, "grain", 0.4);
        this.inflateCardCount("plus", playerIndex, "ore", 0.4);
      }
      if (type === "monopoly") {
        if (this.allData.monopolyPlayer === playerIndex) {
          this.allData.monopolyPlayer = false
        } else {
          this.allData.monopolyPlayer = playerIndex
        }
      }
    },
    showModal(modalName, index, ressource) {
      this.allData.modalValue.index = index
      this.allData.modalValue.ressource = ressource
      this.allData.ressourceValue = this.allData.players[this.allData.modalValue.index].cards[this.allData.modalValue.ressource]
      this.$refs[modalName].show()
    },
    hideModal(modalName) {
      this.$refs[modalName].hide()
    },
    saveNewValue(modalName) {
      this.allData.players[this.allData.modalValue.index].cards[this.allData.modalValue.ressource] = Number(this.allData.ressourceValue)
      this.allData.modalValue.index = null
      this.allData.modalValue.ressource = null
      this.allData.ressourceValue = 0
      this.hideModal(modalName)
    },
    saveCurrentUsername() {
      this.allData.currentUsername = window.document.getElementById('inputUsername').value
    },
    reset() {
      this.allData = Object.assign({}, {
        robbingPlayer: false,
        monopolyPlayer: false,
        ressourceValue: 0,
        playersWhoHaveBeenSetup: {},
        numberOfPlayersWhoHaveBeenSetup: 0,
        youIndex: null,
        currentUsername: this.allData.currentUsername,
        players: [
          {
            id: 1,
            name: "Player 1",
            color: null,
            you: false,
            cards: {
              lumber: 0,
              brick: 0,
              wool: 0,
              grain: 0,
              ore: 0
            }
          },
          {
            id: 2,
            name: "Player 2",
            color: null,
            you: false,
            cards: {
              lumber: 0,
              brick: 0,
              wool: 0,
              grain: 0,
              ore: 0
            }
          },
          {
            id: 3,
            name: "Player 3",
            color: null,
            you: false,
            cards: {
              lumber: 0,
              brick: 0,
              wool: 0,
              grain: 0,
              ore: 0
            }
          },
          {
            id: 4,
            name: "Player 4",
            color: null,
            you: false,
            cards: {
              lumber: 0,
              brick: 0,
              wool: 0,
              grain: 0,
              ore: 0
            }
          }
        ],
        icons: [
          {
            name: "lumber"
          },
          {
            name: "brick"
          },
          {
            name: "wool"
          },
          {
            name: "grain"
          },
          {
            name: "ore"
          },
        ],
        actions: [
          {
            name: "road"
          },
          {
            name: "settlement"
          },
          {
            name: "city"
          },
          {
            name: "development"
          },
          {
            name: "robber"
          },
          { 
            name: "yearsofplenty"
          },
          {
            name: "monopoly"
          }
        ],
        modalValue: {
          index: null,
          ressource: null
        }
      })
      this.$router.go()
    },
    triggerPopup() {
      window.open(
        chrome.runtime.getURL("index.html") + '#/dashboard',
        "Catan Card Tracker",
        "width=400,height=400"
      );
    },
    interpret({username, events}) {
      if (!events) return
      if (events.indexOf('placed a') >= 0) return
      if (events.indexOf('wants to give') >= 0) return
      if (events.indexOf('rolled') >= 0) return
      if (events.indexOf('moved robber') >= 0) return

      if (!username && events.indexOf('You stole') >= 0) {
        const counterparty = events[events.length-1]
        const index = events.indexOf('You stole')
        events.splice(index, 1)
        this.inflateCardCount("plus", this.allData.youIndex, events[0], 1)
        this.inflateCardCount("minus", this.allData.playersWhoHaveBeenSetup[counterparty].index, events[0], 1)
      }

      else if (events.indexOf('received starting resources') >= 0) {
        const index = events.indexOf('received starting resources')
        events.splice(index, 1)
        events.forEach(event => {
          this.inflateCardCount("plus", this.allData.playersWhoHaveBeenSetup[username].index, event, 1)
        });
      }

      else if (events.indexOf('got') >= 0) {
        const index = events.indexOf('got')
        events.splice(index, 1)
        events.forEach(event => {
          this.inflateCardCount("plus", this.allData.playersWhoHaveBeenSetup[username].index, event, 1)
        });
      }

      else if (events.indexOf('traded') >= 0) {
        const counterparty = events[events.length-1]
        const index = events.indexOf('traded')
        events.splice(index, 1)
        let countingLeavingRessources = true
        events.forEach(event => {
          if (event === 'for') {
            countingLeavingRessources = false
          } else if (event === "with") {
            return;
          } else {
            if (countingLeavingRessources) {
              this.inflateCardCount("minus", this.allData.playersWhoHaveBeenSetup[username].index, event, 1)
              this.inflateCardCount("plus", this.allData.playersWhoHaveBeenSetup[counterparty].index, event, 1)
            } else {
              this.inflateCardCount("plus", this.allData.playersWhoHaveBeenSetup[username].index, event, 1)
              this.inflateCardCount("minus", this.allData.playersWhoHaveBeenSetup[counterparty].index, event, 1)
            }
          }
        });
      }

      else if (events.indexOf('stole') >= 0) {
        const counterparty = events[events.length-1]
        const index = events.indexOf('stole')
        events.splice(index, 1)
        if (counterparty === 'from you') {
          this.inflateCardCount("plus", this.allData.playersWhoHaveBeenSetup[username].index, events[0], 1)
          this.inflateCardCount("minus", this.allData.youIndex, events[0], 1)
        } else {
          this.pickedPlayer(null, this.allData.playersWhoHaveBeenSetup[counterparty].index, this.allData.playersWhoHaveBeenSetup[username].index)
        }
      }

      else if (events.indexOf('bought') >= 0) {
        const index = events.indexOf('bought')
        events.splice(index, 1)
        if (events[0] === 'development card') {
          this.runAction('development', this.allData.playersWhoHaveBeenSetup[username].index)
        }
      }

      else if (events.indexOf('built a') >= 0) {
        const index = events.indexOf('built a')
        events.splice(index, 1)
        if (events[0] === 'road') {
          this.runAction('road', this.allData.playersWhoHaveBeenSetup[username].index)
        }
        if (events[0] === 'settlement') {
          this.runAction('settlement', this.allData.playersWhoHaveBeenSetup[username].index)
        }
        if (events[0] === 'city') {
          this.runAction('city', this.allData.playersWhoHaveBeenSetup[username].index)
        }
      }

      else if (events.indexOf('discarded') >= 0) {
        const index = events.indexOf('discarded')
        events.splice(index, 1)
        events.forEach(event => {
          this.inflateCardCount("minus", this.allData.playersWhoHaveBeenSetup[username].index, event, 1)
        });
      }

      else if (events.indexOf('gave bank') >= 0) {
        const index = events.indexOf('gave bank')
        events.splice(index, 1)
        let countingLeavingRessources = true
        events.forEach(event => {
          if (event === 'and took') {
            countingLeavingRessources = false
          } else {
            if (countingLeavingRessources) {
              this.inflateCardCount("minus", this.allData.playersWhoHaveBeenSetup[username].index, event, 1)
            } else {
              this.inflateCardCount("plus", this.allData.playersWhoHaveBeenSetup[username].index, event, 1)
            }
          }
        });
      }
    }
  }
};
</script>

<style scoped>
  a {
    cursor: pointer;
  }
  .main {
    margin: 20px;
  }
  .icon {
    width: 28px;
  }
  .colorBox {
    height: 20px;
    width: 120px;
  }
  .inline {
    display: flex;
    justify-content: space-between;  
  }
</style>