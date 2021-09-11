const { expect } = require('chai');

const increaseTime = async (amount) => {
  await network.provider.request({
    method: 'evm_increaseTime',
    params: [amount]
  });
  await network.provider.request({
    method: 'evm_mine'
  });
}

describe('SmoothReader', () => {
  const initialAnswer = 10000000;
  let feed, smoothReader;

  beforeEach(async () => {
    const Feed = await ethers.getContractFactory('MockV3Aggregator');
    feed = await Feed.deploy(6, initialAnswer);
    await feed.deployed();

    const SmoothReader = await ethers.getContractFactory('SmoothReader');
    smoothReader = await SmoothReader.deploy();
    await smoothReader.deployed();
  });

  describe('smoothLatestAnswer', () => {
    context('when the new price is higher than the old price', () => {
      beforeEach(async () => {
        await feed.updateAnswer(12000000);
      });

      it('should return a number close to the original when read immediately', async () => {
        expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(initialAnswer);
      });

      context('when 25% of the time has passed', () => {
        beforeEach(async () => {
          await increaseTime(15);
        });

        it('should increase the return value by 25%', async () => {
          expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(10500000);
        });
      });

      context('when 50% of the time has passed', () => {
        beforeEach(async () => {
          await increaseTime(30);
        });

        it('should increase the return value by 50%', async () => {
          expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(11000000);
        });
      });

      context('when 75% of the time has passed', () => {
        beforeEach(async () => {
          await increaseTime(45);
        });

        it('should increase the return value by 75%', async () => {
          expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(11500000);
        });
      });

      context('when 100% of the time has passed', () => {
        beforeEach(async () => {
          await increaseTime(60);
        });

        it('should increase the return value by 100%', async () => {
          expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(12000000);
        });
      });
    });

    context('when the new price is lower than the old price', () => {
      beforeEach(async () => {
        await feed.updateAnswer(8000000);
      });

      it('should return a number close to the original when read immediately', async () => {
        expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(initialAnswer);
      });

      context('when 25% of the time has passed', () => {
        beforeEach(async () => {
          await increaseTime(15);
        });

        it('should increase the return value by 25%', async () => {
          expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(9500000);
        });
      });

      context('when 50% of the time has passed', () => {
        beforeEach(async () => {
          await increaseTime(30);
        });

        it('should increase the return value by 50%', async () => {
          expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(9000000);
        });
      });

      context('when 75% of the time has passed', () => {
        beforeEach(async () => {
          await increaseTime(45);
        });

        it('should increase the return value by 75%', async () => {
          expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(8500000);
        });
      });

      context('when 100% of the time has passed', () => {
        beforeEach(async () => {
          await increaseTime(60);
        });

        it('should increase the return value by 100%', async () => {
          expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(8000000);
        });
      });
    });

    context('when multiple updates have been written', () => {
      beforeEach(async () => {
        await increaseTime(10);
        await feed.updateAnswer(8000000);
        await increaseTime(10);
        await feed.updateAnswer(12000000);
      });

      it('should return a smooth value when read immediately', async () => {
        expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(9633332);
      });

      it('should return a smooth value after 10 seconds', async () => {
        await increaseTime(10);
        expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(9750001);
      });

      it('should return a smooth value after 20 seconds', async () => {
        await increaseTime(20);
        expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(9977780);
      });

      it('should return a smooth value after 30 seconds', async () => {
        await increaseTime(30);
        expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(10316666);
      });

      it('should return a smooth value after 40 seconds', async () => {
        await increaseTime(40);
        expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(10766668);
      });

      it('should return a smooth value after 50 seconds', async () => {
        await increaseTime(50);
        expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(11333336);
      });

      it('should return a smooth value after 60 seconds', async () => {
        await increaseTime(60);
        expect(await smoothReader.smoothLatestAnswer(feed.address, 60)).to.be.equal(12000000);
      });
    });
  });
});
