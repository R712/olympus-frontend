import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Paper,
  Tab,
  Tabs,
  Typography,
  Zoom,
  SvgIcon,
  makeStyles,
  Select,
  MenuItem,
} from "@material-ui/core";
import InfoTooltip from "../../components/InfoTooltip/InfoTooltip.jsx";
import { ReactComponent as ArrowUp } from "../../assets/icons/arrow-up.svg";

import { getOhmTokenImage, getTokenImage, trim, formatCurrency } from "../../helpers";
import { changeApproval, changeWrapV2 } from "../../slices/WrapThunk";
import { migrateWithType, migrateCrossChainWSOHM } from "../../slices/MigrateThunk";
import { switchNetwork } from "../../slices/NetworkSlice";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText, txnButtonTextMultiType } from "src/slices/PendingTxnsSlice";
import { Skeleton } from "@material-ui/lab";
import { error } from "../../slices/MessagesSlice";
import { NETWORKS } from "../../constants";
import { ethers } from "ethers";
import "../Stake/stake.scss";
import { Metric, MetricCollection } from "src/components/Metric";
import { t } from "@lingui/macro";
import { useAppSelector } from "src/hooks";
import WrapCrossChain from "./WrapCrossChain";
import { loadAccountDetails } from "src/slices/AccountSlice";
import { Network } from "@ethersproject/providers";
import { NetworkID } from "../../lib/Bond";

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles(theme => ({
  textHighlight: {
    // @ts-ignore
    color: theme.palette.highlight,
  },
}));

function Wrap() {
  const dispatch = useDispatch();
  const { provider, address, connect } = useWeb3Context();
  const networkID = useAppSelector(state => state.network.networkId);
  const networkName = useAppSelector(state => state.network.networkName);

  const [zoomed, setZoomed] = useState(false);
  const [assetFrom, setAssetFrom] = useState("sOHM");
  const [assetTo, setAssetTo] = useState("gOHM");
  const [quantity, setQuantity] = useState("");

  const chooseCurrentAction = () => {
    if (assetFrom === "sOHM") return "Wrap from";
    if (assetTo === "sOHM") return "Unwrap from";
    return "Transform";
  };
  const currentAction = chooseCurrentAction();

  const classes = useStyles();

  const isAppLoading = useAppSelector(state => state.app.loading);
  const isAccountLoading = useAppSelector(state => state.account.loading);
  const currentIndex = useAppSelector(state => {
    return state.app.currentIndex;
  });

  const sOhmPrice = useAppSelector(state => {
    return state.app.marketPrice;
  }) as number;

  const gOhmPrice = useSelector(state => {
    // @ts-ignore
    return Number(state.app.marketPrice) * Number(state.app.currentIndex);
  }) as number;

  const sohmBalance = Number(
    useAppSelector(state => {
      return state.account.balances && state.account.balances.sohm;
    }),
  ) as number;

  const gohmBalance = Number(
    useAppSelector(state => {
      return state.account.balances && state.account.balances.gohm;
    }),
  );

  const unwrapGohmAllowance = useAppSelector(state => {
    return state.account.wrapping && state.account.wrapping.gOhmUnwrap;
  });

  const wrapSohmAllowance = useAppSelector(state => {
    return state.account.wrapping && state.account.wrapping.sohmWrap;
  });

  const pendingTransactions = useSelector(state => {
    //TODO: (aphex) add to state interface
    //@ts-ignore
    return state.pendingTransactions;
  });

  const avax = NETWORKS[43114];
  const arbitrum = NETWORKS[42161];

  const isAvax = useMemo(() => networkID != 1 && networkID != 4 && networkID != -1, [networkID]);

  const wrapButtonText =
    assetTo === "gOHM" ? (assetFrom === "wsOHM" ? "Migrate" : "Wrap") + " to gOHM" : `${currentAction} ${assetFrom}`;

  const setMax = () => {
    if (assetFrom === "sOHM") setQuantity(sohmBalance.toString());
    if (assetFrom === "gOHM") setQuantity(gohmBalance.toString());
  };

  const handleSwitchChain = (id: NetworkID) => {
    return (_e: React.ChangeEvent<unknown>) => {
      dispatch(switchNetwork({ provider: provider, networkId: id }));
      dispatch(loadAccountDetails({ address, provider, networkID: id }));
    };
  };

  const hasCorrectAllowance = useCallback(() => {
    if (assetFrom === "sOHM" && assetTo === "gOHM") return wrapSohmAllowance > Number(sohmBalance);
    if (assetFrom === "gOHM" && assetTo === "sOHM") return unwrapGohmAllowance > Number(gohmBalance);

    return 0;
  }, [unwrapGohmAllowance, wrapSohmAllowance, assetTo, assetFrom, sohmBalance, gohmBalance]);

  //the following is possibly always false, do we need it?
  //@ts-ignore
  const isAllowanceDataLoading = currentAction === "Unwrap";
  // const convertedQuantity = 0;
  const convertedQuantity = useMemo(() => {
    if (assetFrom === "sOHM") {
      return Number(quantity) / Number(currentIndex);
    } else if (assetTo === "sOHM") {
      return Number(quantity) * Number(currentIndex);
    } else {
      return quantity;
    }
  }, [quantity]);

  let modalButton = [];

  modalButton.push(
    <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
      Connect Wallet
    </Button>,
  );

  const changeAssetFrom = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
    setQuantity("");
    //TODO: (aphex): improve this
    setAssetFrom(String(event.target.value));
  };

  const changeAssetTo = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
    setQuantity("");
    //TODO: (aphex): improve this
    setAssetTo(String(event.target.value));
  };

  const approveWrap = (token: string) => {
    dispatch(changeApproval({ address, token: token.toLowerCase(), provider, networkID: networkID }));
  };

  const unwrapGohm = () => {
    dispatch(
      changeWrapV2({
        rebase: false,
        version2: true, //TODO: (aphex) CHECK THIS!
        action: "unwrap",
        value: quantity,
        provider,
        address,
        networkID: networkID,
      }),
    );
  };

  const wrapSohm = () => {
    dispatch(
      changeWrapV2({
        rebase: false,
        version2: false,
        action: "wrap",
        value: quantity,
        provider,
        address,
        networkID: networkID,
      }),
    );
  };

  const approveCorrectToken = () => {
    if (assetFrom === "sOHM" && assetTo === "gOHM") approveWrap("sOHM");
    if (assetFrom === "gOHM" && assetTo === "sOHM") approveWrap("gOHM");
  };

  const chooseCorrectWrappingFunction = () => {
    if (assetFrom === "sOHM" && assetTo === "gOHM") wrapSohm();
    if (assetFrom === "gOHM" && assetTo === "sOHM") unwrapGohm();
  };

  const chooseInputArea = () => {
    if (!address || isAllowanceDataLoading) return <Skeleton width="150px" />;
    if (assetFrom === assetTo) return "";
    if (!hasCorrectAllowance() && assetTo === "gOHM")
      return (
        <div className="no-input-visible">
          First time wrapping to <b>gOHM</b>?
          <br />
          Please approve Olympus to use your <b>{assetFrom}</b> for this transaction.
        </div>
      );
    else if (!hasCorrectAllowance() && assetTo === "sOHM")
      return (
        <div className="no-input-visible">
          First time unwrapping <b>{assetFrom}</b>?
          <br />
          Please approve Olympus to use your <b>{assetFrom}</b> for unwrapping.
        </div>
      );

    return (
      <FormControl className="ohm-input" variant="outlined" color="primary">
        <InputLabel htmlFor="amount-input"></InputLabel>
        <OutlinedInput
          id="amount-input"
          type="number"
          placeholder="Enter an amount"
          className="stake-input"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          labelWidth={0}
          endAdornment={
            <InputAdornment position="end">
              <Button variant="text" onClick={setMax} color="inherit">
                Max
              </Button>
            </InputAdornment>
          }
        />
      </FormControl>
    );
  };

  const chooseButtonArea = () => {
    if (!address) return "";
    if (assetFrom === assetTo) return "";
    if (!hasCorrectAllowance())
      return (
        <Button
          className="stake-button wrap-page"
          variant="contained"
          color="primary"
          disabled={
            isPendingTxn(pendingTransactions, "approve_wrapping") ||
            isPendingTxn(pendingTransactions, "approve_migration")
          }
          onClick={approveCorrectToken}
        >
          {txnButtonTextMultiType(pendingTransactions, ["approve_wrapping", "approve_migration"], "Approve")}
        </Button>
      );

    if (hasCorrectAllowance())
      return (
        <Button
          className="stake-button wrap-page"
          variant="contained"
          color="primary"
          disabled={isPendingTxn(pendingTransactions, "wrapping") || isPendingTxn(pendingTransactions, "migrate")}
          onClick={chooseCorrectWrappingFunction}
        >
          {txnButtonTextMultiType(pendingTransactions, ["wrapping", "migrate"], wrapButtonText)}
        </Button>
      );
  };

  if (!isAvax) {
    // @ts-ignore
    // @ts-ignore
    return (
      <div id="stake-view" className="wrapper">
        <Zoom in={true} onEntered={() => setZoomed(true)}>
          <Paper className={`ohm-card`}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <div className="card-header">
                  <Typography variant="h5">Wrap / Unwrap</Typography>
                  <Link
                    className="migrate-sohm-button"
                    style={{ textDecoration: "none" }}
                    href={
                      assetTo === "wsOHM"
                        ? "https://docs.olympusdao.finance/main/contracts/tokens#wsohm"
                        : "https://docs.olympusdao.finance/main/contracts/tokens#gohm"
                    }
                    aria-label="wsohm-wut"
                    target="_blank"
                  >
                    <Typography>gOHM</Typography>{" "}
                    <SvgIcon component={ArrowUp} color="primary" style={{ marginLeft: "5px", width: ".8em" }} />
                  </Link>
                </div>
              </Grid>
              <Grid item>
                <MetricCollection>
                  <Metric
                    label={`sOHM ${t`Price`}`}
                    metric={formatCurrency(Number(sOhmPrice), 2)}
                    isLoading={sOhmPrice ? false : true}
                  />
                  <Metric
                    label={t`Current Index`}
                    metric={trim(Number(currentIndex), 1)}
                    isLoading={currentIndex ? false : true}
                  />
                  <Metric
                    label={`${assetTo} ${t`Price`}`}
                    metric={formatCurrency(Number(gOhmPrice), 2)}
                    isLoading={gOhmPrice ? false : true}
                    tooltip={`${assetTo} = sOHM * index\n\nThe price of ${assetTo} is equal to the price of OHM multiplied by the current index`}
                  />
                </MetricCollection>
              </Grid>
              <div className="staking-area">
                {!address ? (
                  <div className="stake-wallet-notification">
                    <div className="wallet-menu" id="wallet-menu">
                      {modalButton}
                    </div>
                    <Typography variant="h6">Connect your wallet</Typography>
                  </div>
                ) : (
                  <>
                    <Box className="stake-action-area">
                      <Box style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <>
                          <Typography>
                            <span className="asset-select-label">{currentAction}</span>
                          </Typography>
                          <FormControl
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              margin: "0 10px",
                              height: "33px",
                              minWidth: "69px",
                            }}
                          >
                            <Select
                              id="asset-select"
                              value={assetFrom}
                              label="Asset"
                              onChange={changeAssetFrom}
                              disableUnderline
                            >
                              <MenuItem value={"sOHM"}>sOHM</MenuItem>
                              <MenuItem value={"gOHM"}>gOHM</MenuItem>
                            </Select>
                          </FormControl>

                          <Typography>
                            <span className="asset-select-label"> to </span>
                          </Typography>
                          <FormControl
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                              margin: "0 10px",
                              height: "33px",
                              minWidth: "69px",
                            }}
                          >
                            <Select
                              id="asset-select"
                              value={assetTo}
                              label="Asset"
                              onChange={changeAssetTo}
                              disableUnderline
                            >
                              <MenuItem value={"gOHM"}>gOHM</MenuItem>
                              <MenuItem value={"sOHM"}>sOHM</MenuItem>
                            </Select>
                          </FormControl>
                        </>
                      </Box>
                      <Box display="flex" alignItems="center" style={{ paddingBottom: 0 }}>
                        <div className="stake-tab-panel wrap-page">
                          {chooseInputArea()}
                          {chooseButtonArea()}
                        </div>
                      </Box>
                    </Box>
                    <div className={`stake-user-data`}>
                      <>
                        <div className="data-row">
                          <Typography variant="body1">sOHM Balance</Typography>
                          <Typography variant="body1">
                            {isAppLoading ? <Skeleton width="80px" /> : <>{trim(sohmBalance, 4)} sOHM</>}
                          </Typography>
                        </div>
                        <div className="data-row">
                          <Typography variant="body1">gOHM Balance</Typography>
                          <Typography variant="body1">
                            {isAppLoading ? <Skeleton width="80px" /> : <>{trim(gohmBalance, 4)} gOHM</>}
                          </Typography>
                        </div>

                        <Divider />
                        <Box width="100%" p={1}>
                          <Typography variant="body1" style={{ margin: "15px 0 10px 0" }}>
                            Got wsOHM on Avalanche or Arbitrum? Click below to switch networks and migrate to gOHM (no
                            bridge required!)
                          </Typography>
                          <Button onClick={handleSwitchChain(43114)} variant="outlined" style={{ margin: "0.3rem" }}>
                            <img height="28px" width="28px" src={String(avax.image)} alt={avax.imageAltText} />
                            <Typography variant="h6" style={{ marginLeft: "8px" }}>
                              {avax.chainName}
                            </Typography>
                          </Button>
                          <Button onClick={handleSwitchChain(42161)} variant="outlined" style={{ margin: "0.3rem" }}>
                            <img height="28px" width="28px" src={String(arbitrum.image)} alt={arbitrum.imageAltText} />
                            <Typography variant="h6" style={{ marginLeft: "8px" }}>
                              {arbitrum.chainName}
                            </Typography>
                          </Button>
                        </Box>
                      </>
                    </div>
                  </>
                )}
              </div>
            </Grid>
          </Paper>
        </Zoom>
      </div>
    );
  } else {
    return <WrapCrossChain />;
  }
}

export default Wrap;
