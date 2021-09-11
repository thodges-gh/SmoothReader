# SmoothReader

The SmoothReader contract sits between your project and a Chainlink feed proxy contract to allow prices read from the proxy to be smoothed out over a given amount of time. In short, if the price of an asset on a feed was $100, then suddenly spikes to $200, the price as read through the SmoothReader will linearly increase to $200 based on your smoothing age preference and how long ago that $200 update was written.

The SmoothReader contains no storage and can be used for any Chainlink feed. It has a simple interface with a single function to use: `smoothLatestAnswer(address,uint256)`. The address is that of the feed, and then provide the number of seconds as the age of the latest answer to be smoothed out over the feed's previous answer.

For a more concrete example, let's say the price of a feed has been $100 for the past 10 minutes. Chainlink updates that feed to $200 and you read the answer through the SmoothReader in that same block, with an age preference of 60 seconds. Your contract would still read $100 as the answer, since it was updated 0 seconds ago. After 15 seconds, you would read $125. After 30 seconds $150, 45 seconds $175, and finally after 60 seconds your contract would finally read the price of $200.

If there were multiple updates within the smoothing age preference then the contract simply recursively smoothes out the previous answer until it comes across an answer that is older than the smoothing age preference. This works the same way for updates that are higher or lower in an update.

## Install

```
yarn
```

## Test

```
yarn hardhat test
```
