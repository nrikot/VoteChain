import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Election Contract", function () {
  let Election, election, ElectionFactory, factory;
  let owner, voter1, voter2, voter3;
  let startTime, endTime;

  beforeEach(async function () {
    [owner, voter1, voter2, voter3] = await ethers.getSigners();
    
    // Deploy factory first
    ElectionFactory = await ethers.getContractFactory("ElectionFactory");
    factory = await ElectionFactory.deploy();
    await factory.waitForDeployment();

    // Set up election parameters
    const now = Math.floor(Date.now() / 1000);
    startTime = now + 100; // Start in 100 seconds
    endTime = now + 3600; // End in 1 hour

    const candidateNames = ["Alice Johnson", "Bob Smith", "Carol Davis"];
    const candidateDescriptions = [
      "Computer Science Student",
      "Business Administration Student", 
      "Political Science Student"
    ];

    // Create election through factory
    const tx = await factory.createElection(
      "Test Election",
      "A test election for unit testing",
      candidateNames,
      candidateDescriptions,
      startTime,
      endTime,
      false // Not whitelisted
    );

    const receipt = await tx.wait();
    const event = receipt.logs.find(log => {
      try {
        return factory.interface.parseLog(log).name === "ElectionCreated";
      } catch {
        return false;
      }
    });

    const electionAddress = factory.interface.parseLog(event).args.electionAddress;
    
    Election = await ethers.getContractFactory("Election");
    election = Election.attach(electionAddress);
  });

  describe("Deployment", function () {
    it("Should set the correct election details", async function () {
      expect(await election.name()).to.equal("Test Election");
      expect(await election.description()).to.equal("A test election for unit testing");
      expect(await election.startTime()).to.equal(startTime);
      expect(await election.endTime()).to.equal(endTime);
      expect(await election.isWhitelisted()).to.equal(false);
    });

    it("Should have the correct number of candidates", async function () {
      expect(await election.getCandidateCount()).to.equal(3);
    });

    it("Should set the correct owner", async function () {
      expect(await election.owner()).to.equal(owner.address);
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      // Fast forward to voting period
      await time.increaseTo(startTime + 1);
    });

    it("Should allow voting during active period", async function () {
      await expect(election.connect(voter1).vote(0))
        .to.emit(election, "VoteCast")
        .withArgs(voter1.address, 0, await time.latest() + 1);

      expect(await election.hasVoted(voter1.address)).to.equal(true);
      expect(await election.totalVotes()).to.equal(1);
    });

    it("Should prevent double voting", async function () {
      await election.connect(voter1).vote(0);
      
      await expect(election.connect(voter1).vote(1))
        .to.be.revertedWith("Already voted");
    });

    it("Should prevent voting with invalid candidate ID", async function () {
      await expect(election.connect(voter1).vote(5))
        .to.be.revertedWith("Invalid candidate ID");
    });

    it("Should prevent voting before election starts", async function () {
      // Deploy new election that hasn't started
      const futureStart = Math.floor(Date.now() / 1000) + 3600;
      const futureEnd = futureStart + 3600;

      const tx = await factory.createElection(
        "Future Election",
        "Election that hasn't started",
        ["Candidate A", "Candidate B"],
        ["Description A", "Description B"],
        futureStart,
        futureEnd,
        false
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          return factory.interface.parseLog(log).name === "ElectionCreated";
        } catch {
          return false;
        }
      });

      const futureElectionAddress = factory.interface.parseLog(event).args.electionAddress;
      const futureElection = Election.attach(futureElectionAddress);

      await expect(futureElection.connect(voter1).vote(0))
        .to.be.revertedWith("Election has not started");
    });

    it("Should prevent voting after election ends", async function () {
      // Fast forward past end time
      await time.increaseTo(endTime + 1);

      await expect(election.connect(voter1).vote(0))
        .to.be.revertedWith("Election has ended");
    });
  });

  describe("Results", function () {
    beforeEach(async function () {
      // Fast forward to voting period and cast some votes
      await time.increaseTo(startTime + 1);
      
      await election.connect(voter1).vote(0); // Alice
      await election.connect(voter2).vote(0); // Alice
      await election.connect(voter3).vote(1); // Bob
    });

    it("Should return correct results after voting ends", async function () {
      await time.increaseTo(endTime + 1);

      const [names, descriptions, voteCounts] = await election.getResults();
      
      expect(names[0]).to.equal("Alice Johnson");
      expect(names[1]).to.equal("Bob Smith");
      expect(names[2]).to.equal("Carol Davis");
      
      expect(voteCounts[0]).to.equal(2); // Alice: 2 votes
      expect(voteCounts[1]).to.equal(1); // Bob: 1 vote
      expect(voteCounts[2]).to.equal(0); // Carol: 0 votes
    });

    it("Should identify correct winner", async function () {
      await time.increaseTo(endTime + 1);
      
      expect(await election.getWinningCandidate()).to.equal(0); // Alice (index 0)
    });

    it("Should prevent viewing results during active voting", async function () {
      await expect(election.getResults())
        .to.be.revertedWith("Election is still ongoing");
    });
  });

  describe("Whitelisted Elections", function () {
    let whitelistedElection;

    beforeEach(async function () {
      const now = Math.floor(Date.now() / 1000);
      const whitelistStart = now + 100;
      const whitelistEnd = now + 3600;

      const tx = await factory.createElection(
        "Whitelisted Election",
        "Only registered voters can participate",
        ["Option A", "Option B"],
        ["First option", "Second option"],
        whitelistStart,
        whitelistEnd,
        true // Whitelisted
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          return factory.interface.parseLog(log).name === "ElectionCreated";
        } catch {
          return false;
        }
      });

      const electionAddress = factory.interface.parseLog(event).args.electionAddress;
      whitelistedElection = Election.attach(electionAddress);

      await time.increaseTo(whitelistStart + 1);
    });

    it("Should allow owner to add voters to whitelist", async function () {
      await expect(whitelistedElection.addToWhitelist([voter1.address, voter2.address]))
        .to.emit(whitelistedElection, "VoterWhitelisted")
        .withArgs(voter1.address);

      expect(await whitelistedElection.isAddressWhitelisted(voter1.address)).to.equal(true);
      expect(await whitelistedElection.isAddressWhitelisted(voter2.address)).to.equal(true);
    });

    it("Should prevent non-whitelisted voters from voting", async function () {
      await expect(whitelistedElection.connect(voter1).vote(0))
        .to.be.revertedWith("Address not whitelisted");
    });

    it("Should allow whitelisted voters to vote", async function () {
      await whitelistedElection.addToWhitelist([voter1.address]);
      
      await expect(whitelistedElection.connect(voter1).vote(0))
        .to.emit(whitelistedElection, "VoteCast");
    });
  });

  describe("Election Management", function () {
    it("Should allow owner to finalize election after end time", async function () {
      await time.increaseTo(startTime + 1);
      await election.connect(voter1).vote(0);
      
      await time.increaseTo(endTime + 1);
      
      await expect(election.finalizeElection())
        .to.emit(election, "ElectionFinalized")
        .withArgs(1, 0); // 1 total vote, candidate 0 won
    });

    it("Should prevent non-owner from finalizing election", async function () {
      await time.increaseTo(endTime + 1);
      
      await expect(election.connect(voter1).finalizeElection())
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should return correct election status", async function () {
      expect(await election.getElectionStatus()).to.equal("upcoming");
      
      await time.increaseTo(startTime + 1);
      expect(await election.getElectionStatus()).to.equal("active");
      
      await time.increaseTo(endTime + 1);
      expect(await election.getElectionStatus()).to.equal("ended");
    });
  });
});