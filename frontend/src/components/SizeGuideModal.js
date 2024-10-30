import { SIZE_GUIDES } from '../constants/sizeGuides';
import styles from './style.component/SizeGuideModal.module.css';

const SizeGuideModal = ({ isOpen, onClose, guideType }) => {
  if (!isOpen || !guideType) return null;

  const guide = SIZE_GUIDES[guideType];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <div className={styles.guideContent}>
          <img 
            src={guide.image} 
            alt={guide.name} 
            className={styles.guideImage}
          />
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;