//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV2V3Interface.sol";

contract SmoothReader {

  function smoothLatestAnswer(
    address _feed,
    uint256 _smoothingAge
  ) external view returns (uint256) {
    return getSmoothPrice(
      _feed,
      _smoothingAge,
      uint80(AggregatorV2V3Interface(_feed).latestRound()),
      10 ** AggregatorV2V3Interface(_feed).decimals()
    );
  }

  function getSmoothPrice(
    address _feed,
    uint256 _smoothingAge,
    uint80 _roundId,
    uint256 _rounding
  ) internal view returns (uint256) {
    (,int256 answer,,uint256 updatedAt,) = AggregatorV2V3Interface(_feed).getRoundData(_roundId);
    uint256 timeSinceUpdated = block.timestamp - updatedAt;
    if (timeSinceUpdated >= _smoothingAge || uint64(_roundId) == uint64(1))
      return uint256(answer);
    return smoothPrice(
      getSmoothPrice(_feed, _smoothingAge, _roundId - 1, _rounding),
      uint256(answer),
      getRatio(_smoothingAge, timeSinceUpdated, _rounding),
      _rounding
    );
  }

  function getRatio(
    uint256 _smoothingAge,
    uint256 _timeSinceUpdated,
    uint256 _rounding
  ) internal pure returns (uint256) {
    uint256 timeDiff = _smoothingAge - _timeSinceUpdated;
    return timeDiff * _rounding / _smoothingAge;
  }

  function smoothPrice(
    uint256 _previousAnswer,
    uint256 _answer,
    uint256 _ratio,
    uint256 _rounding
  ) public pure returns (uint256) {
    return _previousAnswer > _answer
      ? _answer + change(_ratio, _previousAnswer - _answer, _rounding)
      : _answer - change(_ratio, _answer - _previousAnswer, _rounding);
  }

  function change(
    uint256 _ratio,
    uint256 _diff,
    uint256 _rounding
  ) internal pure returns (uint256) {
    _diff = _diff == 0 ? 1 : _diff;
    return _ratio * _diff / _rounding;
  }
}
