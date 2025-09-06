import { useAppSelector } from '@/redux/hooks';
import { useGetBrandsQuery } from '@/redux/slices/api/brandApiSlice';
import { useGetCategoriesQuery } from '@/redux/slices/api/categoryApiSlice';
import { useGetsubcategoriesQuery } from '@/redux/slices/api/subcategoryApiSlice';
import { Box, Button, Chip, FormControl, InputAdornment, InputLabel, MenuItem, Paper, Rating, Select, SelectChangeEvent, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { clearSearchKeywordAction } from '@/redux/slices/searchSlice';
import { useDispatch } from 'react-redux';

const ProductsFilters = ({total ,setCurrentPage}:{total :number , setCurrentPage :(page:number)=>void}) => {
    const theme = useTheme();
      const searchParams = useSearchParams();
       const dispatch = useDispatch();
      
type SortDir = "asc" | "desc";

        // from redux (if you want to keep it), but we'll manage local search input as requested
        const { searchKeyWord: searchKeyFromStore } = useAppSelector((s) => s.search);
      
          const [category, setCategory] = useState<string>(
            searchParams.get("category") || ""
          );

            const [subCategory, setSubCategory] = useState<string>(
              searchParams.get("subCategory") || ""
            );

      const [keyword, setKeyword] = useState<string>(
        searchParams.get("keyword") || searchKeyFromStore || ""
      );

        const { data: categoriesResponse } = useGetCategoriesQuery();
        const { data: brandsResponse } = useGetBrandsQuery();
        const { data: subcategoryResponse } = useGetsubcategoriesQuery(
          category ? `?category=${category}` : undefined
        );

          const [brand, setBrand] = useState<string>(searchParams.get("brand") || "");
          const [rating, setRating] = useState<number | "">(
            searchParams.get("rating") ? Number(searchParams.get("rating")) : ""
          );
          const [sortByPrice, setSortByPrice] = useState<SortDir>(
            (searchParams.get("sortByPrice") as SortDir) || "desc" // default: high -> low
          );

          // Handlers
          const handleChangeCategory = (e: SelectChangeEvent<string>) =>
            setCategory(e.target.value);
          const handleChangeSubCategory = (e: SelectChangeEvent<string>) =>
            setSubCategory(e.target.value);
          const handleChangeBrand = (e: SelectChangeEvent<string>) =>
            setBrand(e.target.value);
          const handleChangeSort = (e: SelectChangeEvent<SortDir>) =>
            setSortByPrice(e.target.value as SortDir);
          const handleRatingChange = (e: SelectChangeEvent<string>) => {
            const v = e.target.value;
            setRating(v === "" ? "" : Number(v));
          };
          const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
            setKeyword(e.target.value);
        
        const isXs = useMediaQuery(theme.breakpoints.down("sm"));

        function useDebounced<T>(value: T, delay = 400) {
          const [debounced, setDebounced] = useState(value);
          useEffect(() => {
            const id = setTimeout(() => setDebounced(value), delay);
            return () => clearTimeout(id);
          }, [value, delay]);
          return debounced;
        }
          const debouncedKeyword = useDebounced(keyword, 500);

          const resetFilters = () => {
            setCategory("");
            setSubCategory("");
            setBrand("");
            setRating("");
            setSortByPrice("desc");
            setKeyword("");
            setCurrentPage(1);
            dispatch(clearSearchKeywordAction());
          };  
    
  return (
        <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          mt: "20px",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          background:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.02)"
              : "background.paper",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          flexWrap="wrap"
          sx={{ rowGap: 2.5 ,px:1}}
        >
          {/* Search */}
          <Box sx={{ flex: { xs: "1 0 100%", md: "1 0 33.33%", lg: "1 0 25%" }, minWidth: 100 }}>
            <FormControl fullWidth>
              <TextField
                fullWidth
                label="Search products"
                value={keyword}
                onChange={handleKeywordChange}
                placeholder="Search..."
                   slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: keyword ? (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={() => setKeyword("")}
                          startIcon={<ClearIcon fontSize="small" />}
                        >
                          Clear
                        </Button>
                      </InputAdornment>
                    ) : null,
                  },
                }}
              />
            </FormControl>
          </Box>

          {/* Category */}
          <Box sx={{ flex: { xs: "1 0 100%", sm: "1 0 50%", md: "1 0 33.33%", lg: "1 0 20%" }, minWidth: 100 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={category}
                onChange={handleChangeCategory}
              >
                <MenuItem value={""}>All categories</MenuItem>
                {categoriesResponse?.categories?.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* SubCategory (depends on Category) */}
          <Box sx={{ flex: { xs: "1 0 100%", sm: "1 0 50%", md: "1 0 33.33%", lg: "1 0 20%" }, minWidth: 100 }}>
            <FormControl fullWidth disabled={!category}>
              <InputLabel>SubCategory</InputLabel>
              <Select
                label="SubCategory"
                value={subCategory}
                onChange={handleChangeSubCategory}
              >
                <MenuItem value={""}>All subcategories</MenuItem>
                {subcategoryResponse?.subCategories?.map((sc) => (
                  <MenuItem key={sc._id} value={sc._id}>
                    {sc.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Brand */}
          <Box sx={{ flex: { xs: "1 0 100%", sm: "1 0 50%", md: "1 0 33.33%", lg: "1 0 20%" }, minWidth: 100 }}>
            <FormControl fullWidth>
              <InputLabel>Brand</InputLabel>
              <Select label="Brand" value={brand} onChange={handleChangeBrand}>
                <MenuItem value={""}>All brands</MenuItem>
                {brandsResponse?.brands?.map((b) => (
                  <MenuItem key={b._id} value={b._id}>
                    {b.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Rating */}
          <Box sx={{ flex: { xs: "1 0 100%", sm: "1 0 50%", md: "1 0 33.33%", lg: "1 0 16.67%" }, minWidth: 100 }}>
            <FormControl fullWidth>
              <InputLabel>Rating</InputLabel>
              <Select
                label="Rating"
                value={rating === "" ? "" : String(rating)}
                onChange={handleRatingChange}
              >
                <MenuItem value="">Any</MenuItem>
                {[5, 4, 3, 2, 1].map((r) => (
                  <MenuItem key={r} value={r}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Rating
                        name="read-only"
                        value={r}
                        readOnly
                        size="small"
                        precision={0.5}
                      />
                      <Typography variant="body2">&nbsp;and up</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Sort by price */}
          <Box sx={{ flex: { xs: "1 0 100%", sm: "1 0 50%", md: "1 0 33.33%", lg: "1 0 16.67%" } }}>
            <FormControl fullWidth>
              <InputLabel>Price</InputLabel>
              <Select
                label="Price"
                value={sortByPrice}
                onChange={handleChangeSort}
              >
                <MenuItem value={"desc"}>Price: High → Low</MenuItem>
                <MenuItem value={"asc"}>Price: Low → High</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Reset */}
          <Box sx={{ flex: { xs: "1 0 100%", md: "0 0 auto" } }}>
            <Button
              fullWidth={isXs}
              variant="contained"
              onClick={resetFilters}
              sx={{
                height: 56,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                bgcolor:
                  theme.palette.mainColor?.main || theme.palette.primary.main,
              }}
            >
              Reset Filters
            </Button>
          </Box>
        </Stack>

        {/* Active filters chips */}
        <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
          {category && (
            <Chip
              label="Category selected"
              onDelete={() => setCategory("")}
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
          )}
          {subCategory && (
            <Chip
              label="SubCategory selected"
              onDelete={() => setSubCategory("")}
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
          )}
          {brand && (
            <Chip
              label="Brand selected"
              onDelete={() => setBrand("")}
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
          )}
          {rating !== "" && (
            <Chip
              label={`Rating ≥ ${rating}`}
              onDelete={() => setRating("")}
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
          )}
          {debouncedKeyword && (
            <Chip
              label={`Search: "${debouncedKeyword}"`}
              onDelete={() => setKeyword("")}
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
          )}
          {total > 0 && (
            <Chip
              color="default"
              variant="filled"
              label={`${total} result${total > 1 ? "s" : ""}`}
              sx={{ mr: 1, mb: 1 }}
            />
          )}
        </Stack>
      </Paper>
  )
}

export default ProductsFilters