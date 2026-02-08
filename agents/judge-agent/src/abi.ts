export const AIJudgeABI = [
  {
    "type": "function",
    "name": "commitVote",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "commitHash",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createMarket",
    "inputs": [
      {
        "name": "question",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "resolutionTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "requiredJudges",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "courtId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "deregisterAsJudge",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "finalizeResolution",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getActiveJudgesCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getConfig",
    "inputs": [],
    "outputs": [
      {
        "name": "minJudgeStake",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "challengeStake",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "challengeWindow",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "protocolFeeBasisPoints",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "slashPercentage",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "commitRevealWindow",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getJudge",
    "inputs": [
      {
        "name": "judgeAddr",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct AIJudgeMarket.Judge",
        "components": [
          {
            "name": "stake",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "successfulResolutions",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "failedResolutions",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum AIJudgeMarket.JudgeStatus"
          },
          {
            "name": "registrationTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "reputationScore",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "latestCommitment",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "commitmentBlock",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "courtIds",
            "type": "uint256[]",
            "internalType": "uint256[]"
          },
          {
            "name": "agentId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMarket",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct AIJudgeMarket.Market",
        "components": [
          {
            "name": "question",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "resolutionTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "creator",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum AIJudgeMarket.MarketStatus"
          },
          {
            "name": "outcome",
            "type": "uint8",
            "internalType": "enum AIJudgeMarket.Outcome"
          },
          {
            "name": "requiredJudges",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "judgeRewardPool",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalStaked",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "evidenceHash",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "resolutionTimestamp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "challengeDeadline",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "creationTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "proposedOutcome",
            "type": "uint8",
            "internalType": "enum AIJudgeMarket.Outcome"
          },
          {
            "name": "proposer",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "proposalTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "courtId",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMarketCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getSelectedJudges",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getVote",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "judge",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct AIJudgeMarket.Vote",
        "components": [
          {
            "name": "judge",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "outcome",
            "type": "uint8",
            "internalType": "enum AIJudgeMarket.Outcome"
          },
          {
            "name": "timestamp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "evidenceHash",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "rationaleHash",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "revealed",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "joinCourt",
    "inputs": [
      {
        "name": "courtId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "registerAsJudge",
    "inputs": [
      {
        "name": "stakeAmount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revealVote",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "outcome",
        "type": "uint8",
        "internalType": "enum AIJudgeMarket.Outcome"
      },
      {
        "name": "salt",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "evidenceHash",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "rationaleHash",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "selectJudgesForMarket",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "ChallengeRaised",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "challenger",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "claimedOutcome",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum AIJudgeMarket.Outcome"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "JudgeRegistered",
    "inputs": [
      {
        "name": "judge",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "stake",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "reputationScore",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "JudgeSelected",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "judge",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "selectionTime",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MarketCancelled",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MarketCreated",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "question",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "requiredJudges",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MarketCreatedWithCourt",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "question",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "requiredJudges",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "courtId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MarketResolved",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "outcome",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum AIJudgeMarket.Outcome"
      },
      {
        "name": "evidenceHash",
        "type": "bytes32",
        "indexed": false,
        "internalType": "bytes32"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "VoteCommitted",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "judge",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "commitHash",
        "type": "bytes32",
        "indexed": false,
        "internalType": "bytes32"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "VoteRevealed",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "judge",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "outcome",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum AIJudgeMarket.Outcome"
      }
    ],
    "anonymous": false
  }
] as const;
