import { Link, Outlet } from 'umi';
import styles from './index.less';
import { useEffect } from 'react';

export default function Layout() {
    return (
        <div className={styles.main}>
            <Outlet />
        </div>
    );
}
