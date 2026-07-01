export interface NavLink {
  label: string;
  href: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
}
