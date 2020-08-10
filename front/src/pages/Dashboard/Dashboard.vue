<template>
  <div>
    <h1>Dashboard</h1>

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
      <div class="col-2">
        <dropdown
          v-if="robbingPlayer || robbingPlayer === 0"
          :options="playersWithoutRobber"
          trackBy="id"
          label="name"
          :multiple="false"
          :arrayOfStrings="false"
          description="Player"
          @value="pickedPlayer"
        />
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
        <div class="col-1">
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
              <button @click="inflateCardCount('plus', index, icon.name)">
                +
              </button>
              <button @click="inflateCardCount('minus', index, icon.name)">
                -
              </button>
            </div>
          </div>
        </div>
      </div>
      <br>
    </div>

    <footer>
      Catan Pro &copy; 2020
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
      players: [
        {
          id: 43284,
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
          id: 30030,
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
          id: 39439,
          name: "Player 3",
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
        }
      ]
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
    getImageSource(type, iconName) {
      return require(`../../../public/${type}/${iconName}.png`)
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
        this.robbingPlayer = playerIndex;
      }
    }
  }
};
</script>

<style scoped>
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