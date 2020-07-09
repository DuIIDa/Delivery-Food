'use strict';
new WOW().init();

var swiper = new Swiper('.swiper-container', {
  autoplay: {
    delay: 3000,
  },
});

document.addEventListener('DOMContentLoaded', () => {

  //Получение данных из БД Асинхронная функция
  const getData = async function (url) {
      const response = await fetch(url); 

      if(!response.ok){
        throw new Error(`Status is not a 200!!! ${response.status}`);
      }

      return await response.json();
  };
  //Открытие модалок
  const isOpen = (model) => {
    model.classList.toggle('is-open');
  };

  let login = localStorage.getItem('DeliveryFood');
  let cart = JSON.parse (localStorage.getItem ('DeliveryCart'));


  //Рендор корзины
  const renderCart = () => {
    const modalBody = document.querySelector('.modal-body');
    const modalPricetag = document.querySelector('.modal-pricetag');

    modalBody.textContent = '';
    cart.forEach(({id, cardTitle, cost, count}) => {
      const itemCart = `
        <div class="food-row">
          <span class="food-name">${cardTitle}</span>
          <strong class="food-price">${cost}</strong>
          <div class="food-counter">
            <button class="counter-button counter-minus" data-id="${id}">-</button>
            <span class="counter">${count}</span>
            <button class="counter-button counter-plus" data-id="${id}">+</button>
          </div>
        </div>
      `;

      modalBody.insertAdjacentHTML('beforeend', itemCart);
    });

    const totelPrice = cart.reduce( (resilt, item) => {
      return resilt + (parseFloat(item.cost) * item.count);//ParseFloat берет числа пока не встретить другой смвол
    }, 0);

    localStorage.setItem('DeliveryCart', JSON.stringify(cart));
    modalPricetag.textContent = totelPrice + ' ₽';
  };


  //Карточка с рестораном
  const creatCardRestarant = (restarant) => {
    const cardsRestaurants = document.querySelector('.cards-restaurants');
    const { image, kitchen, name, price, products, stars, time_of_delivery: timeOfDelivery, } = restarant;

    const card = `
    <a class="card card-restaurant" data-products="${products}">
            <img src="${image}" alt="image" class="card-image"/>
            <div class="card-text">
              <div class="card-heading">
                <h3 class="card-title">${name}</h3>
                <span class="card-tag tag">${String(timeOfDelivery)} мин</span>
              </div>
              <!-- /.card-heading -->
              <div class="card-info">
                <div class="rating">
                  ${stars}
                </div>
                <div class="price">От ${price} ₽</div>
                <div class="category">${kitchen}</div>
              </div>
            </div>
    </a>
    `;
    
    cardsRestaurants.insertAdjacentHTML('beforeend', card);
  };
  //Карточка с товаром
  const creadCardGood = (goods) => {
    const cardsMenu = document.querySelector('.cards-menu');
    const { description, id, image, name, price } = goods;

    const card = `
      <div class = "card" id = "${id}">
      <img src="${image}" alt="image" class="card-image"/>
            <div class="card-text">
              <div class="card-heading">
                <h3 class="card-title card-title-reg">${name}</h3>
              </div>
              <div class="card-info">
                <div class="ingredients">${description}</div>
              </div>
              <div class="card-buttons">
                <button class="button button-primary button-add-cart">
                  <span class="button-card-text">В корзину</span>
                  <span class="button-cart-svg"></span>
                </button>
                <strong class="card-price card-price-bold">${price} ₽</strong>
              </div>
            </div>
      </div>
   `;
    
    cardsMenu.insertAdjacentHTML('beforeend', card);
  };


  //Кноки вызова модалок + LogIn
  const openModel = () => {

    const buttons = document.querySelector('.buttons');
    const buttonAuth = document.querySelector('.button-auth');
    const buttonOut = document.querySelector('.button-out');
    const cartButton = document.querySelector('#cart-button');
    const userName = document.querySelector('.user-name');

    const modalAuth = document.querySelector('.modal-auth');
    const modalCart = document.querySelector('.modal-cart');

    buttons.addEventListener('click', (event) => {
      let target = event.target;
      
      if(target.closest('.button-auth')) {
        isOpen(modalAuth);
      }else if(target.closest('.button-out')) {
        login = null;
        localStorage.removeItem('DeliveryFood');
        buttonAuth.style.display = 'flex';
        buttonOut.style.display = 'none';
        cartButton.style.display = 'none';
        userName.style.display = 'none';
        userName.textContent = login;
      } else if(target.closest('#cart-button')) {
        renderCart();
        isOpen(modalCart);
      }
    });

    if(login) {
      buttonAuth.style.display = 'none';
      buttonOut.style.display = 'flex';
      cartButton.style.display = 'flex';
      userName.style.display = 'inline';
      userName.textContent = login;
    }

    if(!cart) {
      cart = [];
    }

  };
  openModel();


  //Функционал модалок
  const useModel = () => {
    const modelAll = document.querySelectorAll('.model-all');

    const modalAuth = document.querySelector('.modal-auth');
    const logInForm = document.querySelector('#logInForm');

    const modalCart = document.querySelector('.modal-cart');
    const modelOrder = document.querySelector('#model-order');

    const buttonAuth = document.querySelector('.button-auth');
    const buttonOut = document.querySelector('.button-out');
    const cartButton = document.querySelector('#cart-button');
    const userName = document.querySelector('.user-name');

    const changeCount = (target) => {
      const food = cart.find( (item) => {
        return item.id === target.dataset.id;
      });

      if(target.closest('.counter-minus')){
        food.count--;
        if(food.count === 0){
          cart.splice(cart.indexOf(food), 1);
        }
      }else {
        food.count++;
      }
      renderCart();
    };

    modelAll.forEach(item => {
      item.addEventListener('click', (event) => {
        let target = event.target;
    
        if(target.classList.contains('close')){
          isOpen(item);
          logInForm.reset();
        }else {
          target = target.closest('.modal-dialog');
                    
          if(!target){
              isOpen(item);
              logInForm.reset();
          }
        }
      });
    });

    logInForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const inputLogin = document.querySelector('#login');
      login = inputLogin.value;

      buttonAuth.style.display = 'none';
      buttonOut.style.display = 'flex';
      userName.style.display = 'inline';
      cartButton.style.display = 'flex';
      userName.textContent = login;

      localStorage.setItem('DeliveryFood', login);

      isOpen(modalAuth);
      logInForm.reset();
    });

    modalCart.addEventListener('click', (event) => {
      let target = event.target;

      const targetButton = target.closest('.counter-button');
      
      if(targetButton){
        changeCount(targetButton);
      }else if(target.classList.contains('clear-cart')) {
        cart.length = 0;
        renderCart();
      }else if(target.classList.contains('button-primary')) {
        if(cart.length !== 0){
          isOpen(modelOrder);
        }
      }
    });

  };
  useModel();

  
  //Генерация карточек
  const renderResorants = () => {
    const modalAuth = document.querySelector('.modal-auth');

    const cardsRestaurants = document.querySelector('.cards-restaurants');
    const containerPromo = document.querySelector('.container-promo');
    const restaurants = document.querySelector('.restaurants');
    const cardsMenu = document.querySelector('.cards-menu');
    const menu = document.querySelector('.menu');
    const logo = document.querySelector('.logo');

    const changeSectionHeadig = (targetRastarant)  => {
      const restaurantTitle = document.querySelector('.restaurant-title');
      const cardInfo = document.querySelector('.card-info-menu');
      
      restaurantTitle.textContent = targetRastarant.querySelector('.card-title').textContent;
      cardInfo.innerHTML = targetRastarant.querySelector('.card-info').innerHTML;
    };

    cardsRestaurants.addEventListener('click', (event) => {
      let target = event.target;
      target = target.closest('.card-restaurant');
      if(target){
        if(login){

          changeSectionHeadig(target);

          containerPromo.classList.add('hide');
          restaurants.classList.add('hide');
          menu.classList.remove('hide');

          cardsMenu.textContent = '';

          getData(`./db/${target.dataset.products}`).then( (data) => {
            data.forEach(creadCardGood);
          });

        }else {
          isOpen(modalAuth);
        }
      }
    });

    logo.addEventListener('click', () => {
      containerPromo.classList.remove('hide');
      restaurants.classList.remove('hide');
      menu.classList.add('hide');
    });

    getData('./db/partners.json').then( (data) => {
      data.forEach(creatCardRestarant);
    });

  };
  renderResorants();


  //Корзина
  const functCart = () => {
    const cardsMenu = document.querySelector('.cards-menu');

    cardsMenu.addEventListener('click', (event) => {
      let target = event.target;

      if(target.closest('.button-add-cart')){
        const card = target.closest('.card');
        const cardTitle = card.querySelector('.card-title-reg').textContent;
        const cost = card.querySelector('.card-price').textContent;
        const idCard = card.id;
        
        const food = cart.find( (item) => {
          return item.id === idCard;
        });

        if(food) {
          food.count += 1;
        }else {
          cart.push({
            id: idCard,
            cardTitle: cardTitle,
            cost: cost,
            count: 1
          });
        }

      }
    });
  };
  functCart();


  //ПОИСК
  const search = () => {
    const inputSearch =  document.querySelector('.input-search');

    inputSearch.addEventListener('change', (event) => {
      const value = event.target.value.toLowerCase();
      const cardsRestaurants = document.querySelector('.cards-restaurants');

      cardsRestaurants.textContent = '';
			getData('./db/partners.json')
				.then((data) => {
					
					const products = data.map(function(item){
            return [item.name, item.kitchen];
          });
          return products;
        })
        .then( (data) => {
          const searchGoods = data.filter((item) => {
            return item[0].toLowerCase().includes(value) || item[1].toLowerCase().includes(value);
          });
          
          if(searchGoods.length === 0){
            cardsRestaurants.innerHTML = `<p class ="empty-search">Ничего не найдено!(</p>`;
            return;
          }
          
          getData('./db/partners.json')
          .then((data) => {
            const rezult = data.map(function(item){
              return item;
            });

            rezult.forEach( (item) => {
              if(searchGoods.find( elem => elem[0] === item.name)){
                creatCardRestarant(item);
              }
            });
          });

        });
    });
  };
  search();
  
});
