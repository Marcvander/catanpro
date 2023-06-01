<template>
  <div class="main">

    <div>
      <h2>Catan Card Tracker</h2>
    </div>

    <div class="row">
      <div
        v-for="(player, index) in players"
        :key="player.id"
      >
        <div class="col">
          <span :style="`color:${player.color}`">{{player.name}}</span>
          <color-selector @value="setValue($event, index)"/>
        </div>
      </div>
    </div>

    <br>

    <div class="row">
      <div v-if="robbingPlayer || robbingPlayer === 0">
        <span :style="`color:${players[robbingPlayer].color}`" >Player {{ robbingPlayer + 1 }}</span> is robbing
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
      <div v-if="monopolyPlayer || monopolyPlayer === 0">
        <span :style="`color:${players[monopolyPlayer].color}`" >Player {{ monopolyPlayer + 1 }}</span> is using monopoly on
        <dropdown
          :options="icons"
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
      v-for="(player, index) in players"
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
              v-for="action in actions"
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
            v-for="icon in icons"
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

    <b-modal ref="change-value" hide-footer title="Change value">
      <b-form-input id="newValue" type="number" v-model="ressourceValue"></b-form-input>
      <b-button class="mt-3" variant="outline-success" @click="saveNewValue('change-value')">Save</b-button>
    </b-modal>

    <footer>
      Catan Card Tracker &copy; 2023. Developed by Marc Vanderstigel (m.vds78@gmail.com)
      <br>
      <img
        :src="getImageSource('logo', 'catanpro', 'jpg')"
        alt="Logo"
        width="70"
      /> 
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
      robbingPlayer: false,
      monopolyPlayer: false,
      ressourceValue: 0,
      players: [
        {
          id: 1,
          name: "Player 1",
          color: null,
          cards: {
            wood: 0,
            clay: 0,
            sheep: 0,
            wheat: 0,
            ore: 0
          }
        },
        {
          id: 2,
          name: "Player 2",
          color: null,
          cards: {
            wood: 0,
            clay: 0,
            sheep: 0,
            wheat: 0,
            ore: 0
          }
        },
        {
          id: 3,
          name: "Player 3",
          color: null,
          cards: {
            wood: 0,
            clay: 0,
            sheep: 0,
            wheat: 0,
            ore: 0
          }
        },
        {
          id: 4,
          name: "Player 4",
          color: null,
          cards: {
            wood: 0,
            clay: 0,
            sheep: 0,
            wheat: 0,
            ore: 0
          }
        }
      ],
      icons: [
        {
          name: "wood"
        },
        {
          name: "clay"
        },
        {
          name: "sheep"
        },
        {
          name: "wheat"
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
          name: "colony"
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
    };
  },
  created() {

  },
  computed: {
    playersWithoutRobber() {
      const playersWithoutRobber = this.players.filter((player, index) => {
        if ((index !== this.robbingPlayer) && player.color) return true;
      })
      return playersWithoutRobber;
    }
  },
  methods: {
    setValue(v, number) {
      this.players[number].color = `#${v.hex}`
    },
    pickedPlayer(v) {
      const playerIndex = this.players.findIndex(player => player.id === v.id);
      const robberProbability = this.loseFromRobber(playerIndex);
      for (const cardName in this.players[this.robbingPlayer].cards) {
        this.inflateCardCount("plus", this.robbingPlayer, cardName, robberProbability[cardName]);
        this.roundTo2DecimalPlaces(this.robbingPlayer, cardName);
      }
      this.robbingPlayer = false;
    },
    pickedRessource(v) {
      const ressource = v.name
      for (let i=0; i < this.players.length; i++) {
        const player = this.players[i]
        if (player.id !== this.monopolyPlayer + 1) {
          if (player.cards[ressource]) {
            this.inflateCardCount("plus", this.monopolyPlayer, ressource, player.cards[ressource]);
            this.roundTo2DecimalPlaces(this.monopolyPlayer, ressource);
            this.inflateCardCount("minus", player.id - 1, ressource, player.cards[ressource]);
            this.roundTo2DecimalPlaces(player.id - 1, ressource);
          }
        }
      }
      this.monopolyPlayer = false;
    },
    getImageSource(type, iconName, format = 'png') {
      return require(`../../../public/${type}/${iconName}.${format}`)
    },
    inflateCardCount(type, playerIndex, iconName, value = 1) {
      if (type === "plus") {
        this.players[playerIndex].cards[iconName] += value;
      }
      if (type === "minus") {
        this.players[playerIndex].cards[iconName] -= value;
        if (this.players[playerIndex].cards[iconName] < 0) this.players[playerIndex].cards[iconName] = 0;
      }
      this.roundTo2DecimalPlaces(playerIndex, iconName);

    },
    loseFromRobber(playerIndex) {
      const robberProbability = {};
      let playerTotalCards = 0;
      for (const cardName in this.players[playerIndex].cards) {
        playerTotalCards += this.players[playerIndex].cards[cardName];
      }
      for (const cardName in this.players[playerIndex].cards) {
        const probability = this.players[playerIndex].cards[cardName] / playerTotalCards;
        robberProbability[cardName] = isNaN(probability) ? 0 : probability;
        this.inflateCardCount("minus", playerIndex, cardName, robberProbability[cardName]);
        this.roundTo2DecimalPlaces(playerIndex, cardName);
      }
      return robberProbability;
    },
    roundTo2DecimalPlaces(playerIndex, cardName) {
      this.players[playerIndex].cards[cardName] = Math.round((this.players[playerIndex].cards[cardName] + Number.EPSILON) * 100) / 100;
    },
    runAction(type, playerIndex) {
      if (type === "road") {
        this.inflateCardCount("minus", playerIndex, "wood");
        this.inflateCardCount("minus", playerIndex, "clay");
      }
      if (type === "colony") {
        this.inflateCardCount("minus", playerIndex, "wood");
        this.inflateCardCount("minus", playerIndex, "clay");
        this.inflateCardCount("minus", playerIndex, "sheep");
        this.inflateCardCount("minus", playerIndex, "wheat");
      }
      if (type === "city") {
        this.inflateCardCount("minus", playerIndex, "wheat");
        this.inflateCardCount("minus", playerIndex, "wheat");
        this.inflateCardCount("minus", playerIndex, "ore");
        this.inflateCardCount("minus", playerIndex, "ore");
        this.inflateCardCount("minus", playerIndex, "ore");
      }
      if (type === "development") {
        this.inflateCardCount("minus", playerIndex, "sheep");
        this.inflateCardCount("minus", playerIndex, "wheat");
        this.inflateCardCount("minus", playerIndex, "ore");
      }
      if (type === "robber") {
        if (this.robbingPlayer === playerIndex) {
          this.robbingPlayer = false
        } else {
          this.robbingPlayer = playerIndex
        }
      }
      if (type === "yearsofplenty") {
        this.inflateCardCount("plus", playerIndex, "wood", 0.4);
        this.inflateCardCount("plus", playerIndex, "clay", 0.4);
        this.inflateCardCount("plus", playerIndex, "sheep", 0.4);
        this.inflateCardCount("plus", playerIndex, "wheat", 0.4);
        this.inflateCardCount("plus", playerIndex, "ore", 0.4);
      }
      if (type === "monopoly") {
        if (this.monopolyPlayer === playerIndex) {
          this.monopolyPlayer = false
        } else {
          this.monopolyPlayer = playerIndex
        }
      }
    },
    showModal(modalName, index, ressource) {
      this.modalValue.index = index
      this.modalValue.ressource = ressource
      this.ressourceValue = this.players[this.modalValue.index].cards[this.modalValue.ressource]
      this.$refs[modalName].show()
    },
    hideModal(modalName) {
      this.$refs[modalName].hide()
    },
    saveNewValue(modalName) {
      this.players[this.modalValue.index].cards[this.modalValue.ressource] = Number(this.ressourceValue)
      this.modalValue.index = null
      this.modalValue.ressource = null
      this.ressourceValue = 0
      this.hideModal(modalName)
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