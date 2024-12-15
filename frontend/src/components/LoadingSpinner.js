// frontend/src/components/LoadingSpinner.js
import React from "react";
import styles from "./style.component/LoadingSpinner.module.css";

const LoadingSpinner = () => {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Đang tải...</p>
    </div>
  );
};

export default LoadingSpinner;
