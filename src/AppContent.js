import React, { useEffect, useState, useCallback } from "react";
import { Layout, Input, Button } from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import {
  getCategoryType,
  getContentType,
  isCatetoryType,
  isFileType,
  isSearchType,
} from "./utils";
import { MainFileGrid, CategoryGrid } from "./CustomGrid";
import LocationMap from "./LocationMap";
import EmptyData from "./EmptyData";
import { AppMode } from "./constants";

const { Header } = Layout;
const { Search } = Input;

const GET_LIMIT = 100;

const AppContent = ({ mode, onImport, setMode }) => {
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);

  const [inputTextSearch, setInputTextSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const [hasMore, setHasMore] = useState(false);

  // handle back clicked after view files detail on each category
  const handleBackClicked = () => {
    setFiles([]);
  };

  // handle text on input search changed to update inputSearchText
  const handleOnSearchTextChanged = (event) => {
    setInputTextSearch(event.target.value);
  };

  // handle search with search value
  const handleOnSearch = useCallback(
    async (offset) => {
      console.log("handleOnSearch from offset:", offset);
      setHasMore(false);

      const opt = {
        text: searchValue,
        offset: offset,
        limit: GET_LIMIT,
      };

      try {
        const result = await window.electron.ipcRenderer.invoke(
          "db-find-files-by-search",
          JSON.stringify(opt)
        );
        console.log("result of db-find-files-by-search success:", result);
        setFiles((files) => [...files, ...result]);
        setHasMore(result.length === GET_LIMIT);
      } catch (error) {
        console.log("result of db-find-files-by-search error:", error);
      }
    },
    [searchValue]
  );

  // when search icon clicked -> update searchValue and change appMode to search
  const onSearch = useCallback(
    async (value) => {
      console.log("onSearch", value);
      setMode(AppMode.MODE_SEARCH);
      setSearchValue(inputTextSearch);
    },
    [setMode, inputTextSearch]
  );

  // handle when user clickes on each category item
  const handleOnCategorySelected = useCallback(
    async (id) => {
      console.log("handleCategorySelectedChanged id:", id);
      if (categories.length > id) {
        setFiles([]);
        setInputTextSearch("");
        setSearchValue("");

        const opt = {
          category: categories[id],
          offset: 0,
          limit: GET_LIMIT,
        };

        try {
          const result = await window.electron.ipcRenderer.invoke(
            "db-find-files-by-category",
            JSON.stringify(opt)
          );
          console.log("result of db-find-files-by-category success:", result);
          setFiles(result);
        } catch (error) {
          console.log("result of db-find-files-by-category error:", error);
        }
      }
    },
    [categories]
  );

  // find files by type (photo, video, document)
  const findFilesByType = useCallback(async (contentType, offset) => {
    setHasMore(false);

    const opt = {
      type: contentType,
      offset: offset,
      limit: GET_LIMIT,
    };

    try {
      const result = await window.electron.ipcRenderer.invoke(
        "db-find-files-by-type",
        JSON.stringify(opt)
      );
      console.log("result of db-find-files-by-type success:", result);
      setFiles((files) => [...files, ...result]);
      setHasMore(result.length === GET_LIMIT);
    } catch (error) {
      console.log("result of db-find-files-by-type error:", error);
    }
  }, []);

  // find categories (location, calendar, device)
  const findCategoriesByType = useCallback(async (categoryType, offset) => {
    setHasMore(false);

    const opt = {
      type: categoryType,
      offset: offset,
      limit: GET_LIMIT,
    };

    try {
      const result = await window.electron.ipcRenderer.invoke(
        "db-find-categories-by-type",
        JSON.stringify(opt)
      );
      console.log("result of db-find-categories-by-type success:", result);
      setCategories((categories) => [...categories, ...result]);
      setHasMore(result.length === GET_LIMIT);
    } catch (error) {
      console.log("result of db-find-categories-by-type error:", error);
    }
  }, []);

  // handle app mode changes
  useEffect(() => {
    if (isFileType(mode)) {
      setFiles([]);
      setCategories([]);
      setInputTextSearch("");
      setSearchValue("");
      findFilesByType(getContentType(mode), 0);
      return;
    }

    if (isCatetoryType(mode)) {
      setFiles([]);
      setCategories([]);
      setInputTextSearch("");
      setSearchValue("");
      findCategoriesByType(getCategoryType(mode), 0);
      return;
    }

    if (isSearchType(mode)) {
      setFiles([]);
      setCategories([]);
      handleOnSearch(0);
      return;
    }
  }, [findFilesByType, findCategoriesByType, handleOnSearch, mode]);

  // handle load more button is clicked
  const handleLoadMore = useCallback(() => {
    console.log("handleLoadMore with mode:", mode);
    if (isFileType(mode)) {
      setCategories([]);
      setInputTextSearch("");
      setSearchValue("");
      findFilesByType(getContentType(mode), files.length);
      return;
    }

    if (isCatetoryType(mode)) {
      setFiles([]);
      setInputTextSearch("");
      setSearchValue("");
      findCategoriesByType(getCategoryType(mode), categories.length);
      return;
    }

    if (isSearchType(mode)) {
      setCategories([]);
      handleOnSearch(files.length);
      return;
    }
  }, [
    findFilesByType,
    findCategoriesByType,
    handleOnSearch,
    mode,
    files.length,
    categories.length,
  ]);

  return (
    <React.Fragment>
      <Header className="site-layout-header">
        <Search
          className="header-search"
          placeholder="input search text"
          allowClear
          onSearch={onSearch}
          value={inputTextSearch}
          onChange={handleOnSearchTextChanged}
        />
        <div className="icons-list">
          <Button
            type="primary"
            shape="round"
            style={{ opacity: files.length && categories.length }}
            icon={<ArrowLeftOutlined />}
            onClick={handleBackClicked}
          >
            Back
          </Button>
          <Button
            type="primary"
            shape="round"
            icon={<UploadOutlined />}
            onClick={onImport}
          >
            Import
          </Button>
        </div>
      </Header>
      <Layout className="site-layout-content">
        {files.length === 0 && categories.length === 0 && <EmptyData />}
        {files.length > 0 && <MainFileGrid files={files} />}
        {categories.length > 0 &&
          files.length === 0 &&
          mode !== AppMode.MODE_MAP && (
            <CategoryGrid
              categories={categories}
              categoryType={getCategoryType(mode)}
              onCategorySelected={handleOnCategorySelected}
            />
          )}
        {categories.length > 0 &&
          files.length === 0 &&
          mode === AppMode.MODE_MAP && (
            <LocationMap
              categories={categories}
              onCategorySelected={handleOnCategorySelected}
            />
          )}
      </Layout>
      <Button
        type="primary"
        shape="round"
        style={{ width: "200px", margin: "8px auto" }}
        disabled={!hasMore}
        onClick={handleLoadMore}
      >
        Load More
      </Button>
    </React.Fragment>
  );
};

export default AppContent;
