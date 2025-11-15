addToCartButton = document.getElementsByClassName("addButton");

            let afterSchool = new Vue ({
                el: "#app",
                data:{
                        lessons: [],
                            cart: [],
                            checkout: [],
                            key: '',
                            order: '',
                            showCheckout: true,
                            showbill: false,
                        orderInformation: {
                                nameInput: '',
                                phoneNumber: '',
                                email: '',
                                spaces:[],
                                lessonId: [] 
                             }

                            
                    },

                     created: function () {
                        fetch("http://localhost:3000/Afterschool/lesson"). then(
                        function(response) {
                            response.json().then (
                                function(json){
                                    afterSchool.lessons = json; 
                                }
                            )
                        }
                    )
                },

                methods: {
                    addToCart: function(lesson) {
                        if(lesson.spaces > 0){
                        this.cart.push(lesson);
                        lesson.spaces--;
                        
                        } 

                        
                    },

                    removeFromCart: function(lesson){
                        const index =  this.cart.indexOf(lesson);
                        if(index !== -1){
                        this.cart.splice(index, 1)
                        lesson.spaces++;
                        }
                    },

                    isFull: function(lesson){
                    return lesson.spaces === 0;
                    },
                    

                     showCart: function() {
                    
                    if(!this.showCheckout && this.cart.length === 0)
                        return;
                    
                    
                     this.showCheckout = !this.showCheckout; 
        
                },

                goBack: function() {
                        this.showCheckout = true;
                    },

                saveOrderInfo: function() {

                        const lessonIds = this.cart.map(lesson => lesson._id)

                    fetch("http://localhost:3000/Afterschool/orderInfo ", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: this.orderInformation.nameInput,
                            phoneNumber: this.orderInformation.phoneNumber,
                            email: this.orderInformation.email,
                            spaces: this.spaces,
                            lessonId: lessonIds,
                            
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log("Order saved:", data);
                        this.showbill = true;
                    })
                    .catch(error => {
                        console.error("Error saving order:", error);
                    });
},

                closeBill: function(){
                    this.showbill = false;
                // edit this make the form reset after closing and reset the cart and make sure the spaces gets updated
              
                },

            
                   
                },


                computed: {
                    cartCount: function() {
                        return this.cart.length;
                    },
                

                    sortfunction:  function(){
                            let  sortedList =  this.lessons.slice();

                            if(!this.key || !this.order){
                                return sortedList
                            }
                            const order = this.order === 'asc' ? 1 : -1;

                            if(this.key === 'subject') {
                                return sortedList.sort((a,b) => a.subject.localeCompare(b.subject) * order)
                        
                            } else if (this.key === 'price') {
                               return sortedList.sort((a,b) => (a.price - b.price) * order
                                )
                            } else if (this.key === 'location') {
                               return sortedList.sort((a,b) => a.location.localeCompare(b.location) * order
                                )
                            } else if (this.key === 'spaces') {
                                return sortedList.sort((a,b) =>
                                    (a.spaces - b.spaces) * order
                                ) }
                            else  {
                               return sortedList }
                    },


                   validatePhone: function() {
                     let regex = /^\d{10}$/;
                     let phoneNumber = this.orderInformation.phoneNumber.trim() ;
                     return !!(regex.test(phoneNumber) && phoneNumber)
                   },

                   validateName: function(){
                    let regex = (/^[A-Za-z]+$/);
                    let name = this.orderInformation.nameInput.trim()
                    return !!(regex.test(name) && name)
                   },

                   validateEmail:function (){
                    let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
                    let email = this.orderInformation.email.trim();

                    return !!(regex.test(email) && email);
                   },

                    isFormFilled: function(){
                    return this.validateEmail && this.validateName && this.validatePhone
                        
                   },

                   showPhoneError: function(){
                    return this.orderInformation.phoneNumber.length > 0 && !this.validatePhone},

                   showNameError: function(){
                    return this.orderInformation.nameInput.length > 0 && !this.validateName
                   },
                   showEmailError: function(){

                    return  this.orderInformation.email.length > 0  && !this.validateEmail;


                },}
    

    
            })