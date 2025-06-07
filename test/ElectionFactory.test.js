import { expect } from "chai";
import { ethers } from "hardhat";

describe("ElectionFactory Contract", function () {
  let ElectionFactory, factory, Election;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    ElectionFactory = await ethers.getContractFactory("ElectionFactory");
    factory = await ElectionFactory.deploy();
    await factory.waitForDeployment();

    Election = await ethers.getContractFactory("Election");
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await factory.getAddress()).to.be.properAddress;
    });

    it("Should start with zero elections", async function () {
      expect(await factory.getElectionCount()).to.equal(0);
      
      const allElections = await factory.getAllElections();
      expect(allElections.length).to.equal(0);
    });
  });

  describe("Election Creation", function () {
    const candidateNames = ["Alice", "Bob", "Charlie"];
    const candidateDescriptions = ["Candidate A", "Candidate B", "Candidate C"];
    let startTime, endTime;

    beforeEach(function () {
      const now = Math.floor(Date.now() / 1000);
      startTime = now + 100;
      endTime = now + 3600;
    });

    it("Should create a new election successfully", async function () {
      const tx = await factory.connect(user1).createElection(
        "Test Election",
        "A test election",
        candidateNames,
        candidateDescriptions,
        startTime,
        endTime,
        false
      );

      await expect(tx)
        .to.emit(factory, "ElectionCreated")
        .withArgs(
          await ethers.getAddress(tx), // This will be replaced with actual address
          "Test Election",
          user1.address,
          startTime,
          endTime
        );

      expect(await factory.getElectionCount()).to.equal(1);
    });

    it("Should reject election with invalid time range", async function () {
      await expect(
        factory.createElection(
          "Invalid Election",
          "End time before start time",
          candidateNames,
          candidateDescriptions,
          endTime, // End time as start
          startTime, // Start time as end
          false
        )
      ).to.be.revertedWith("Start time must be before end time");
    });

    it("Should reject election with insufficient candidates", async function () {
      await expect(
        factory.createElection(
          "Invalid Election",
          "Only one candidate",
          ["Alice"],
          ["Candidate A"],
          startTime,
          endTime,
          false
        )
      ).to.be.revertedWith("Must have at least 2 candidates");
    });

    it("Should reject election with mismatched candidate arrays", async function () {
      await expect(
        factory.createElection(
          "Invalid Election",
          "Mismatched arrays",
          ["Alice", "Bob"],
          ["Candidate A"], // Only one description for two names
          startTime,
          endTime,
          false
        )
      ).to.be.revertedWith("Candidate names and descriptions length mismatch");
    });

    it("Should track user elections correctly", async function () {
      // User1 creates two elections
      await factory.connect(user1).createElection(
        "Election 1",
        "First election",
        candidateNames,
        candidateDescriptions,
        startTime,
        endTime,
        false
      );

      await factory.connect(user1).createElection(
        "Election 2",
        "Second election",
        candidateNames,
        candidateDescriptions,
        startTime + 1000,
        endTime + 1000,
        false
      );

      // User2 creates one election
      await factory.connect(user2).createElection(
        "Election 3",
        "Third election",
        candidateNames,
        candidateDescriptions,
        startTime + 2000,
        endTime + 2000,
        false
      );

      const user1Elections = await factory.getUserElections(user1.address);
      const user2Elections = await factory.getUserElections(user2.address);

      expect(user1Elections.length).to.equal(2);
      expect(user2Elections.length).to.equal(1);
      expect(await factory.getElectionCount()).to.equal(3);
    });
  });

  describe("Election Retrieval", function () {
    beforeEach(async function () {
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + 100;
      const endTime = now + 3600;

      // Create multiple elections
      for (let i = 0; i < 3; i++) {
        await factory.connect(user1).createElection(
          `Election ${i + 1}`,
          `Description ${i + 1}`,
          ["Alice", "Bob"],
          ["Candidate A", "Candidate B"],
          startTime + (i * 100),
          endTime + (i * 100),
          false
        );
      }
    });

    it("Should return all elections", async function () {
      const allElections = await factory.getAllElections();
      expect(allElections.length).to.equal(3);
    });

    it("Should return correct election count", async function () {
      expect(await factory.getElectionCount()).to.equal(3);
    });

    it("Should return user-specific elections", async function () {
      const userElections = await factory.getUserElections(user1.address);
      expect(userElections.length).to.equal(3);

      const emptyUserElections = await factory.getUserElections(user2.address);
      expect(emptyUserElections.length).to.equal(0);
    });
  });

  describe("Created Election Properties", function () {
    let electionAddress;

    beforeEach(async function () {
      const now = Math.floor(Date.now() / 1000);
      const startTime = now + 100;
      const endTime = now + 3600;

      const tx = await factory.connect(user1).createElection(
        "Property Test Election",
        "Testing election properties",
        ["Alice", "Bob", "Charlie"],
        ["Computer Science", "Business", "Political Science"],
        startTime,
        endTime,
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

      electionAddress = factory.interface.parseLog(event).args.electionAddress;
    });

    it("Should create election with correct properties", async function () {
      const election = Election.attach(electionAddress);

      expect(await election.name()).to.equal("Property Test Election");
      expect(await election.description()).to.equal("Testing election properties");
      expect(await election.isWhitelisted()).to.equal(true);
      expect(await election.owner()).to.equal(user1.address);
      expect(await election.getCandidateCount()).to.equal(3);
    });

    it("Should create election with correct candidates", async function () {
      const election = Election.attach(electionAddress);

      const [name0, desc0] = await election.getCandidate(0);
      const [name1, desc1] = await election.getCandidate(1);
      const [name2, desc2] = await election.getCandidate(2);

      expect(name0).to.equal("Alice");
      expect(desc0).to.equal("Computer Science");
      expect(name1).to.equal("Bob");
      expect(desc1).to.equal("Business");
      expect(name2).to.equal("Charlie");
      expect(desc2).to.equal("Political Science");
    });
  });
});