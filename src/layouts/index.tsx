import React from 'react';
import { Link, Outlet } from 'umi';
import styles from './index.less';

type PropsType = {
    children: React.ReactNode;
};

export default function Layout(props: PropsType) {
    return (
        <div className={styles.navs}>
            <Link to="/home">Home</Link>
            <Outlet />
        </div>
    );
}
