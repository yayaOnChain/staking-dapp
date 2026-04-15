// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title YieldFarm
 * @dev A farming contract that accepts LP tokens and distributes reward tokens per block.
 */
contract YieldFarm is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable lpToken;
    IERC20 public immutable rewardToken;

    uint256 public rewardPerBlock;
    uint256 public lastRewardBlock;
    uint256 public accRewardPerShare;

    uint256 public totalStaked;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }
    mapping(address => UserInfo) public userInfo;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Harvest(address indexed user, uint256 amount);

    constructor(
        address _lpToken,
        address _rewardToken,
        uint256 _rewardPerBlock
    ) {
        lpToken = IERC20(_lpToken);
        rewardToken = IERC20(_rewardToken);
        rewardPerBlock = _rewardPerBlock;
        lastRewardBlock = block.number;
    }

    /**
     * @dev Update reward variables
     */
    function updatePool() public {
        if (block.number <= lastRewardBlock) {
            return;
        }

        // Only skip if no one has staked AND no pending rewards to calculate
        if (totalStaked == 0) {
            // Just update lastRewardBlock, don't accumulate
            lastRewardBlock = block.number;
            return;
        }

        uint256 blocksPassed = block.number - lastRewardBlock;
        uint256 reward = blocksPassed * rewardPerBlock;
        accRewardPerShare += (reward * 1e18) / totalStaked;
        lastRewardBlock = block.number;
    }

    function pendingReward(address _user) external view returns (uint256) {
        UserInfo storage user = userInfo[_user];

        // Calculate what accRewardPerShare would be after updatePool
        uint256 accRewardPerShareLocal = accRewardPerShare;
        if (block.number > lastRewardBlock && totalStaked > 0) {
            uint256 blocksPassed = block.number - lastRewardBlock;
            uint256 reward = blocksPassed * rewardPerBlock;
            accRewardPerShareLocal += (reward * 1e18) / totalStaked;
        }

        uint256 pending = (user.amount * accRewardPerShareLocal) /
            1e18 -
            user.rewardDebt;
        return pending;
    }

    function deposit(uint256 amount) external nonReentrant {
        updatePool();
        UserInfo storage user = userInfo[msg.sender];

        if (user.amount > 0) {
            uint256 pending = (user.amount * accRewardPerShare) /
                1e18 -
                user.rewardDebt;
            if (pending > 0) {
                rewardToken.safeTransfer(msg.sender, pending);
                emit Harvest(msg.sender, pending);
            }
        }

        if (amount > 0) {
            lpToken.safeTransferFrom(msg.sender, address(this), amount);
            user.amount += amount;
            totalStaked += amount;
        }

        user.rewardDebt = (user.amount * accRewardPerShare) / 1e18;
        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) public nonReentrant {
        updatePool();
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= amount, "Insufficient balance");

        uint256 pending = (user.amount * accRewardPerShare) /
            1e18 -
            user.rewardDebt;
        if (pending > 0) {
            rewardToken.safeTransfer(msg.sender, pending);
            emit Harvest(msg.sender, pending);
        }

        if (amount > 0) {
            user.amount -= amount;
            totalStaked -= amount;
            lpToken.safeTransfer(msg.sender, amount);
        }

        user.rewardDebt = (user.amount * accRewardPerShare) / 1e18;
        emit Withdraw(msg.sender, amount);
    }

    function harvest() external {
        withdraw(0);
    }
}
