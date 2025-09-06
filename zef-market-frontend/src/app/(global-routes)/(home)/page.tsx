"use client";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import { styled, alpha } from "@mui/material/styles";
import Image from "next/image";
import { useGetCategoriesQuery } from "@/redux/slices/api/categoryApiSlice";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { createSearchKeywordAction } from "@/redux/slices/searchSlice";
import Grid from "@mui/material/Grid";
// import SearchParamComponent from "./_componens/SearchParamComponent";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  paddingLeft: 0,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    // marginLeft: theme.spacing(1),
    width: "auto",
    minWidth: "200px",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  fontSize: "14px",
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("sm")]: {
      fontSize: "16px",
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

export default function Home() {
  const router = useRouter();
  const searcParam = useSearchParams();
  const searchPramQuery = searcParam.get("CategoryIdfromAdminDashBoard");
  const dispatch = useAppDispatch();
  const { searchKeyWord } = useAppSelector((state) => state.search);
  const [searchWord, setSearchWord] = useState("");
  const { data: categoriesResponse } = useGetCategoriesQuery();
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategory] = useState(searchPramQuery || "");
  const { userInfo } = useAppSelector((state) => state.auth);

  // const {
  //   data: coursesResponse,
  //   refetch,
  //   isLoading,
  // } = useGetCoursesQuery(
  //   `?search=${searchKeyWord || ""}&page=${currentPage}&category=${category}`
  // );

  const resetFiltersAndSearch = () => {
    setCategory("");
    setSearchWord("");
    setCurrentPage(1);
    dispatch(createSearchKeywordAction(""));
    // refetch();
  };
  return (
    <Container>
      <Stack direction={"row"} sx={{ pt: 1,px:5, justifyContent: "flex-start",gap:1 }}>
        <Button variant="contained" size="small" sx={{textTransform:"capitalize"}} onClick={()=> router.push("/products")}>Products</Button>
          <Button variant="contained" size="small" sx={{textTransform:"capitalize"}}>Categories</Button>
      </Stack>
      <Stack sx={{ px: { xs: 2, sm: 4, md: 6 }, py: 2 }}>
        {/* <SearchParamComponent returnPath="/admin-dashboard/categories" /> */}
        <Box
          sx={{
            width: "100%",
            aspectRatio: "16/9",
            overflow: "hidden",
            "& img": {
              objectFit: "cover",
              width: "100%",
              height: "100%",
            },
          }}
        >
          <Image
            alt="hero"
            src="/zef-market-hero.jpg"
            width={1920}
            height={1080}
            quality={100}
            style={{ width: "100%", height: "100%" }}
          />
        </Box>
        {/* <Grid
          container
          spacing={2}
          sx={{
            alignItems: "space-between",
            justifyContent: "center",
            mb: 2,
            mt: 3,
            width: { xs: "100%", sm: "80%", md: "60%" },
          }}
        ></Grid> */}
      </Stack>
    </Container>
  );
}
